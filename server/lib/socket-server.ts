import { IncomingMessage } from 'http';
import { Server, WebSocket, ServerOptions, RawData } from 'ws';
import { v4 as uuid } from 'uuid';

const HEARTBEAT_INTERVAL = Number.parseInt(process.env['SOC_HEARTBEAT_INTERVAL'] || '30000', 10);
const PORT = Number.parseInt(process.env['SOC_PORT'] || '8080', 10);
const LOG_LEVEL = process.env['SOC_LOG_LEVEL'];

export type LogLevel = 'off'| 'debug' | 'info' | 'warning' | 'error';

interface ExtendedWebSocket extends WebSocket {
  isAlive?: boolean;
  clientId?: string;
  userId?: string;
  clientType?: string;
  peer?: ExtendedWebSocket;
  peerId: string;
}

export interface SocketMessage {
  type: 'ping' | 'handshake' | 'message';
  audience?: 'peer' | 'server';
  origin: 'peer' | 'server';
  payload: any;
}

export class SocketServer {
  private server!: Server<WebSocket>;
  private logging = LOG_LEVEL || 'off';
  private port = PORT || 8080;
  private heartbeatInterval = HEARTBEAT_INTERVAL || 30000;
  private heartbeatTimer: any;

  private clients: ExtendedWebSocket[] = [];

  public setLogLevel = (logLevel: LogLevel) => this.logging = logLevel;
  public setPort = (port: number) => this.port = port;
  public setHeartbeatInterval = (interval: number) => this.heartbeatInterval = interval;

  public serve = (): void => {
    this.logInfo(' ');
    this.logInfo(`Socket Server listening on port ${this.port}.`);
    this.server = new WebSocket.Server(<ServerOptions>{ port: this.port });

    this.logInfo(`Establishing heartbeat at interval: ${this.heartbeatInterval/1000} seconds.`);
    this.pingClients();
    
    this.server.on('connection', (socket: ExtendedWebSocket, message: IncomingMessage) => this.onConnection(socket, message));
    this.server.on('close', () => this.onClose());
    this.server.on('error', (error: Error) => this.onError(error));
  };

  /***************************************
   * UTILITY FUNCTIONS
   */

  private sendMsg = (toId: string, msg: any) => this.clients.find(c => c.clientId === toId)?.send(JSON.stringify(msg));

  private clientById = (id: string) => this.clients.find(c => c.clientId === id);

  private processMessage = (msg: SocketMessage, clientId: string): void => {
    switch(msg.type) {
    case 'handshake':
      this.logDebug('Processing handshake message');
      if (!msg.payload.userId || !msg.payload.clientType) {
        this.logWarning(`Client ${clientId} sent invalid handshake payload.`, msg);
      } else {
        const client = this.clientById(clientId);
        if (client) {
          client.userId = msg.payload.userId;
          client.clientType = msg.payload.clientType;
        }
        
        const peer = this.clients.find(c => c.userId === msg.payload.userId && c.clientType !== msg.payload.clientType);
        if (peer) {
          this.logInfo(`Peer connection established: ${clientId} / ${peer.clientId}.`);
          if (client) {
            client.peer = peer;
            client.peerId = peer.clientId?.slice() || '';
          }
          peer.peer = client;
          peer.peerId = client?.clientId?.slice() || '';
          this.sendMsg(peer.clientId || '', { type: 'handshake', origin: 'peer', payload: { clientId: clientId, clientType: msg.payload.clientType } });
          this.sendMsg(clientId, { type: 'handshake', origin: 'peer', payload: { clientId: peer.clientId, clientType: peer.clientType } });
        } else {
          this.logDebug('No suitable peer found. Waiting for handshake...');
        }
      }
      break;

    case 'message':
      if (msg.audience === 'peer') {
        msg.origin = 'peer';
        const client = this.clientById(clientId);
        if (client && client.peer) {
          this.logDebug(`Forwarding message to peer: ${client.peer.clientId}.`);
          this.sendMsg(client.peer.clientId || '', msg);
        }
      }
      break;
    }
  };

  /***************************************
   * EVENT HANDLERS
   */

  private onConnection = (socket: ExtendedWebSocket, message: IncomingMessage) => {
    const clientId = uuid();
    socket.clientId = clientId;
    socket.isAlive = true;
    this.clients.push(socket);

    this.logInfo('Client Connected.');
    socket.on('message', (data: RawData, isBinary: boolean) => this.onMessage(data, isBinary, clientId));
    socket.on('close', (code: number, reason: Buffer) => this.onClientClose(clientId, code, reason));
    socket.on('error', (error: Error) => this.onClientError(error));
  };

  private onMessage = (data: RawData, isBinary: boolean, clientId: string): void => {
    const client = this.clientById(clientId);
    if (client) {
      client.isAlive = true;
    }
    
    this.logDebug('Received: %s', data);
    let msg: SocketMessage;
    try {
      msg = <SocketMessage>JSON.parse(String(data));
      if (!msg.type || !msg.payload) {
        throw 'Unexpected message format. Missing type or message property.';
      }
      this.processMessage(msg, clientId);
    } catch(e) {
      this.logWarning(`Received malformed message: ${data}`, e);
    }
  };

  private onClose = () => {
    this.logDebug('onClose()');
    return false;
  };

  private onError = (error: Error) => {
    this.logDebug('onError()', error);
    return false;
  };

  private onClientClose = (clientId: string, code: number, reason: Buffer) => {
    this.logDebug('onClientClose()', clientId, code, reason.toString());
    // Signal the disconnect to any peers.
    const peer = this.clients.find(c => c.peerId === clientId);
    if (peer) {
      this.sendMsg(peer?.clientId || '', { type: 'message', origin: 'server', payload: 'Peer disconnected' });
    }
    return false;
  };

  private onClientError = (error: Error) => {
    this.logDebug('onClientError()', error);
    return false;
  };

  /***************************************
   * Log METHODS
   */

  private logDebug = (...args: any) => {
    if (['debug'].indexOf(this.logging) !== -1)
      console.debug(...args);
  };

  private logInfo = (...args: any) => {
    if (['debug', 'info'].indexOf(this.logging) !== -1)
      console.info(...args);
  };

  private logWarning = (...args: any) => {
    if (['debug', 'info', 'warning'].indexOf(this.logging) !== -1)
      console.warn(...args);
  };

  private logError = (...args: any) => {
    if (['debug', 'info', 'warning', 'error'].indexOf(this.logging) !== -1)
      console.error(...args);
  };

  /***************************************
   * HEARTBEAT METHODS
   */

  // Kill zombies, ping the remaining clients, then reset the interval.
  private pingClients = () => {
    this.logDebug('pingClients()');
    clearTimeout(this.heartbeatTimer);
    this.killZombies();
    this.clients.forEach(c => {
      const id = c.clientId || '';
      const client = this.clients.find(client => client.clientId === id);
      this.sendMsg(id, { type: 'ping', payload: 'ping' });
      if (client) {
        client.isAlive = false;
      }
    });
    this.heartbeatTimer = setTimeout(() => this.pingClients(), this.heartbeatInterval);
  };

  // For each zombie, signal disconnect to the peer, close the connection, and remove the client.
  private killZombies = () => {
    this.clients.filter(c => c.isAlive === false).forEach(c => {
      const peer = this.clientById(c.peer?.clientId || '');
      if (peer) {
        this.sendMsg(c.peer?.clientId || '', { type: 'message', origin: 'server', payload: 'Peer disconnected' });
        this.logDebug(`Peer disconnected due to timeout: ${peer.clientId}.`);
      }
      const clientIx = this.clients.findIndex(client => client.clientId === c.clientId);  
      c.terminate();
      this.clients.splice(clientIx);
    });
  };

}
