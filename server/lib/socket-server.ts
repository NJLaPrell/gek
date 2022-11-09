import { IncomingMessage } from 'http';
import { Server, WebSocket, ServerOptions, RawData,  } from 'ws';

const HEARTBEAT_INTERVAL = Number.parseInt(process.env['SOC_HEARTBEAT_INTERVAL'] || '30000', 10);
const PORT = Number.parseInt(process.env['SOC_HEARTBEAT_INTERVAL'] || '8080', 10);
const LOG_LEVEL = process.env['SOC_LOG_LEVEL'];

export type LogLevel = 'off'| 'debug' | 'info' | 'warning' | 'error';

interface ExtendedWebSocket extends WebSocket {
  isAlive?: boolean;
}

export interface SocketMessage {
  type: 'ping' | 'handshake' | 'ident' | 'message';
  direction: 'inbound' | 'outbound';
  payload: any;
}

export class SocketServer {
  private server!: Server<WebSocket>;
  private logging = LOG_LEVEL || 'off';
  private port = PORT || 8080;
  private heartbeatInterval = HEARTBEAT_INTERVAL || 30000;

  public setLogLevel = (logLevel: LogLevel) => this.logging = logLevel;
  public setPort = (port: number) => this.port = port;
  public setHeartbeatInterval = (interval: number) => this.heartbeatInterval = interval;

  public serve = (): void => {
    this.server = new WebSocket.Server(<ServerOptions>{ port: this.port });
    this.server.on('connection', (socket: WebSocket, message: IncomingMessage) => this.onConnection(socket, message));
    this.server.on('close', () => this.onClose());
    this.server.on('error', (error: Error) => this.onError(error));
  };

  private onConnection = (socket: ExtendedWebSocket, message: IncomingMessage) => {
    this.logInfo('Client Connected.');
    socket.isAlive = true;
    socket.on('message', (self: ExtendedWebSocket, data: RawData, isBinary: boolean) => this.onMessage(self, data, isBinary));
    socket.on('close', (self: WebSocket, code: number, reason: Buffer) => this.onClientClose(self, code, reason));
    socket.on('error', (error: Error) => this.onClientError(error));
    
  };

  private onMessage = (socket: ExtendedWebSocket, data: RawData, isBinary: boolean) => {
    this.logDebug('Received: %s', data);

    let msg: SocketMessage;
    try {
      msg = <SocketMessage>JSON.parse(String(data));

      if (msg?.type !== 'ping' && msg.direction === 'outbound'){
        msg.direction = 'inbound';
        this.server.clients.forEach((cs: ExtendedWebSocket) => {
          const message = JSON.stringify(msg);
          this.logDebug(`Sending: ${message}`);
          cs.send(message);
        });
      }


    } catch(e) {
      this.logWarning(`Received malformed message: ${data}`, e);
    }
  };

  private onClose = () => {
    return false;
  };

  private onError = (error: Error) => {
    return false;
  };

  private onClientClose = (socket: WebSocket, code: number, reason: Buffer) => {
    return false;
  };

  private onClientError = (error: Error) => {
    return false;
  };

  private logDebug = (...args: any) => {
    if (['debug', 'info', 'warning', 'error'].indexOf(this.logging) !== -1)
      console.info(...args);
  };

  private logInfo = (...args: any) => {
    if (['info', 'warning', 'error'].indexOf(this.logging) !== -1)
      console.info(...args);
  };

  private logWarning = (...args: any) => {
    if (['warning', 'error'].indexOf(this.logging) !== -1)
      console.warn(...args);
  };

  private logError = (...args: any) => {
    if (['error'].indexOf(this.logging) !== -1)
      console.error(...args);
  };

  

}

/*

function heartbeat() {
    console.log('-heartbeat-');
    this.isAlive = true;
}

const wss = new WebSocket.Server({ port: PORT });


// Ping each client and send a heartbeat.
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
        console.log('Lost heartbeat. Disconnecting client.')
        return ws.terminate();
    }
    console.log('-ping-')
    ws.send('{ "type": "ping", "direction": "inbound"}');
    ws.isAlive = false;
    ws.ping();
  });
}, HEARTBEAT_INTERVAL);

wss.on('connection', (ws, req) => {
    console.log('Client connected.');
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    ws.send('{ "type": "ping", "direction": "inbound"}');
    ws.on('message', function message(data) {
        let msg = {};
        try {
            msg = JSON.parse(data);
            console.log('Received: %s', data);
        } catch(e) {
            console.log(`Received malformed message: ${data}`)
            console.log(e);
        }
        
        if (msg.type && msg.type !== 'ping' && msg.direction === 'outbound'){
            msg.direction = 'inbound';
            wss.clients.forEach(function each(w) {
                console.log(`Sending: ${JSON.stringify(msg)}`);
                w.send(JSON.stringify(msg));
            })
        }
    });
});


// Clear the heartbeat interval on close.
wss.on('close', function close() {
    console.log('Connection closed.');
    clearInterval(interval);
});

console.log('Websocket Server started:');
console.log(`  Listening on port ${PORT}.`)
console.log(`  Heartbeat interval is ${HEARTBEAT_INTERVAL/1000} seconds.`)

*/