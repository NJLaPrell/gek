import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';

const SOCKET_URL = environment.socket_url;
const HEARTBEAT_INTERVAL = environment.heartbeatInterval;
const RECONNECT_INTERVAL = environment.reconnectInterval;
const RECONNECT_ATTEMPTS = environment.reconnectMaxAttempts;
const HANDSHAKE_INTERVAL: number = environment.handshakeInterval;
const DEBUG = environment.debug.socketService;

export interface SocketMessage {
    payload: any;
    type: 'message' | 'ping' | 'handshake' | 'peerDisconnect';
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private connection: any = false;

  // Service Listeners
  private messageListeners: Function[] = [];
  private errorListeners: Function[] = [];
  private closedListeners: Function[] = [];
  private connectListeners: Function[] = [];
  private disconnectListeners: Function[] = [];
  private handshakeListeners: Function[] = [];
  private peerDisconnectListeners: Function[] = [];
  private serverTimeoutListeners: Function[] = [];

  private pingTimeout: any;
  private reconnectInterval: any;
  private retryAttempts = 0;
  private connected = false;
  private handshakeTimout: any;
  private handshakeInterval = HANDSHAKE_INTERVAL;

  constructor() { }


  /**************************************************
   * PUBLIC METHODS
   */

  // Connect to the socket server if not already connected.
  public connect() {
    if(!this.connection || this.connection.closed) {
      this.connectClient();
    }
  }

  // Send a message of type:'message'
  public sendMessage(payload: any) {
    this.sendRawMessage({ type: 'message', payload });
  }

  // Start sending handshake messages at the handshakeInterval.
  public sendHandshake(userId: string, clientType: string) {
    const handshake = <SocketMessage>{ type: 'handshake', payload: { userId, clientType } };
    this.debug(`Sending Handshake: ${JSON.stringify(handshake)}`);
    this.sendRawMessage(handshake);
    clearTimeout(this.handshakeTimout);
    this.handshakeTimout = setTimeout(() => this.sendHandshake(userId, clientType), this.handshakeInterval);
  }

  // Disconnect from the server.
  public disconnect(clientType: string) {
    this.debug('[Socket Service] - Disconnect');
    // Send peer disconnect message
    //this.sendRawMessage({ type: 'peerDisconnect', payload: clientType });
    // Reset the instance
    this.messageListeners = [];
    this.errorListeners = [];
    this.closedListeners = [];
    this.connectListeners = [];
    this.handshakeListeners = [];
    this.peerDisconnectListeners = [];
    this.retryAttempts = 0;
    // Reset the timers
    clearTimeout(this.pingTimeout);
    clearTimeout(this.reconnectInterval);
    clearTimeout(this.handshakeTimout);

    this.fireDisconnect();

    // Disconnect the socket connection.
    this.connection.complete();
    delete this.connection;
    this.connected = false;  
  }


  /**************************************************
   * EVENT LISTENERS/TRIGGERS
   * 
   * "on" methods attach a listener to an event.
   * "fire" methods trigger the attached event listeners.
   */

  // Fired for any message received of type:'message'
  public onMessageReceived(msgListener: Function) {
    this.messageListeners.push(msgListener);
  }

  // Fired when an error is caught from the server.
  public onError(errorListener: Function) {
    this.errorListeners.push(errorListener);
  }

  // Fired when the server closes the connection
  public onClosed(closedListener: Function) {
    this.closedListeners.push(closedListener);
  }

  private fireOnClosed() {
    this.debug('[Socket Service] - Connection closed');
    clearTimeout(this.pingTimeout);
    this.closedListeners.forEach(func => func());
  }

  // Fired when the first message is received.
  public onConnect(connectListener: Function) {
    this.connectListeners.push(connectListener);
  }
  
  private fireOnConnect() {
    this.debug('[Socket Service] - Connected');
    clearTimeout(this.pingTimeout);
    this.connectListeners.forEach(func => func());
  }

  // Fired when a message of type:'handshake' is received.
  public onHandshake(handshakeListener: Function) {
    this.handshakeListeners.push(handshakeListener);
  }

  private fireOnHandshake(payload: { clientId:string; clientType: string }) {
    this.debug(`[Socket Service] - Handshake received from: ${payload.clientId} (${payload.clientType})`);
    this.handshakeListeners.forEach(func => func(payload));
  }

  // Fired when message of type:'peerDisconnect' is received.
  public onPeerDisconnect(peerDisconnectListener: Function) {
    this.peerDisconnectListeners.push(peerDisconnectListener);
  }

  private firePeerDisconnect(client: string) {
    this.debug(`[Socket Service] - Peer Disconnected (${client}`);
    this.peerDisconnectListeners.forEach(func => func(client));
  }

  // Fired when heartbeat expires without communication from the server.
  public onServerTimeout(serverTimeoutListener: Function) {
    this.serverTimeoutListeners.push(serverTimeoutListener);
  }

  private fireServerTimeout() {
    this.debug(`[Socket Service] - Server Timed Out.`);
    this.serverTimeoutListeners.forEach(func => func());
  }

  // Fired when the client disconnects from the server.
  public onDisconnect(disconnectListener: Function) {
    this.disconnectListeners.push(disconnectListener);
  }

  private fireDisconnect() {
    this.debug(`[Socket Service] - Client disconnected.`);
    this.disconnectListeners.forEach(func => func());
  }


  /**************************************************
   * INTERNAL EVENT HANDLING
   */

  // Handle client connect.
  private connectClient(retry = false) {
    if (!retry) {
      this.debug('[Socket Service] - Connecting to the socket server.');
    }
    this.connection = webSocket(SOCKET_URL);
    this.connection.subscribe({
      next: (msg: SocketMessage) => this.onRawMessageReceived(<SocketMessage>msg), // Called whenever there is a message from the server.
      error: (err: any) => {
        this.debug('[Socket Service] - Error caught:', err);
        this.connected = false;
        this.errorListeners.forEach(func => func(err));
        clearTimeout(this.reconnectInterval);
        this.reconnectInterval = setTimeout(() => this.retry(), RECONNECT_INTERVAL);
      },
      complete: () => this.fireOnClosed() // Called when connection is closed (for whatever reason).
    });
  }

  // Handle raw processing of all messages.
  private onRawMessageReceived(msg: SocketMessage) {
    // Any inbound message indicates the server is alive
    if (!this.connected) {
      this.connected = true;
      this.fireOnConnect();
      this.heartbeat();
    }
    // Handle messages by type.        
    if(msg.type === 'message') {
      this.debug('[Socket Service] - Message Recieved.', msg);
      this.messageListeners.forEach(func => func(msg.payload));
    } else if (msg.type === 'handshake') {
      this.debug('[Socket Service] - Handshake Recieved.', msg);
      clearTimeout(this.handshakeTimout);
      this.fireOnHandshake(msg.payload);
    } else if (msg.type=== 'peerDisconnect') {
      this.debug('[Socket Service] - Peer Disconnect Recieved.', msg);
      this.firePeerDisconnect(msg.payload);
    } else if (msg.type === 'ping') {
      this.debug('[Socket Service] - Pinged by the server.');
      this.sendPing(); // Respond to the server ping.
      this.heartbeat(); // Mark the server as alive.
    }
  }


  /**************************************************
   * UTILITY METHODS
   * 
   * Expect a ping from the server every interval. If one is not 
   * received, assume the server is unreachable, close the
   * connection, and start retry attempts.
   */

  private sendRawMessage = (msg: SocketMessage) => {
    this.connect();
    this.connection.next(msg);
  };

  private sendPing = () => this.sendRawMessage({ type: 'ping', payload: 'ping' });

  private debug = (...args: any) => DEBUG ? console.debug(...args) : null;
  

  /**************************************************
   * HEARTBEAT
   * 
   * Expect a ping from the server every interval. If one is not 
   * received, assume the server is unreachable, close the
   * connection, and start retry attempts.
   */
   private heartbeat() {
    this.debug('[Socket Service] - Heartbeat.');
    clearTimeout(this.pingTimeout);
    clearTimeout(this.reconnectInterval);
    this.retryAttempts = 0;
    this.pingTimeout = setTimeout(() => {
      this.fireServerTimeout();
      this.connection.complete();
      this.connected = false;
      this.retry();
    }, HEARTBEAT_INTERVAL + 5000);
  }
  // Attempt reconnect when the connection times out.
  private retry() {
    clearTimeout(this.reconnectInterval);
    this.retryAttempts++;
    if (this.retryAttempts <= RECONNECT_ATTEMPTS) {
      this.debug(`[Socket Service] - Attempting reconnect (attempt ${this.retryAttempts} of ${RECONNECT_ATTEMPTS}).`);
      this.connectClient(true);
      this.reconnectInterval = setTimeout(() => this.retry(), RECONNECT_INTERVAL);
    } else {
      this.debug('[Socket Service] - Unable to reconnect.');
    }
  }

}