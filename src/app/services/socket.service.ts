import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';

const SOCKET_URL = environment.socket_url;
const HEARTBEAT_INTERVAL = 30000; // 30 Seconds
const RECONNECT_INTERVAL = 30000; // 30 Seconds
const RECONNECT_ATTEMPTS = 10;
const DEBUG = false;

export interface SocketMessage {
    message?: any;
    direction: 'inbound' | 'outbound';
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
  private handshakeListeners: Function[] = [];
  private peerDisconnectListeners: Function[] = [];

  private pingTimeout: any;
  private reconnectInterval: any;
  private retryAttempts = 0;
  private connected = false;

  constructor() {
    //this.connect();
    //setTimeout(() => !this.connected ? this.retry() : null, RECONNECT_INTERVAL);
  }

  // Timeout function for heartbeat.
  private heartbeat() {
    this.debug('-heartbeat-');
    clearTimeout(this.pingTimeout);
    clearTimeout(this.reconnectInterval);
    this.retryAttempts = 0;
    
    this.pingTimeout = setTimeout(() => {
      this.debug('[Socket Service] - Connection timed out.');
      this.connection.complete();
      this.connected = false;
      this.retry();
    }, HEARTBEAT_INTERVAL + 5000);
  }

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
    if (msg.direction === 'inbound' && !this.connected) {
      this.connected = true;
      this.fireOnConnect();
      this.heartbeat();
    }
        
    if (msg.type !== 'ping' && msg.type !== 'handshake') {
      this.debug('[Socket Service] - Message Recieved.', msg);
    }
        
    if(msg?.direction === 'inbound' && msg?.type === 'message') {
      this.messageListeners.forEach(func => func(msg?.message));
    } else if (msg.direction === 'inbound' && msg.type === 'handshake') {
      this.fireOnHandshake(msg.message);
    } else if (msg.direction === 'inbound' && msg.type=== 'peerDisconnect') {
      this.firePeerDisconnect(msg.message);
    } else if (msg.type === 'ping') {
      this.heartbeat();
    }
  }

  // Connect to the socket server if not already connected.
  public connect() {
    if(!this.connection || this.connection.closed) {
      this.connectClient();
    }    
  }

  public onMessageReceived(msgListener: Function) {
    this.messageListeners.push(msgListener);
  }

  public onError(errorListener: Function) {
    this.errorListeners.push(errorListener);
  }

  public onClosed(closedListener: Function) {
    this.closedListeners.push(closedListener);
  }

  public onConnect(connectListener: Function) {
    this.connectListeners.push(connectListener);
  }

  public onHandshake(handshakeListener: Function) {
    this.handshakeListeners.push(handshakeListener);
  }
  public onPeerDisconnect(peerDisconnectListener: Function) {
    this.peerDisconnectListeners.push(peerDisconnectListener);
  }

  private firePeerDisconnect(client: string) {
    this.debug(`[Socket Server] - Peer Disconnected (${client}`);
    this.peerDisconnectListeners.forEach(func => func(client));
  }

  private fireOnConnect() {
    this.debug('[Socket Server] - Connected');
    clearTimeout(this.pingTimeout);
    this.connectListeners.forEach(func => func());
  }

  private fireOnClosed() {
    this.debug('[Socket Server] - Connection closed');
    clearTimeout(this.pingTimeout);
    this.closedListeners.forEach(func => func());
  }

  private fireOnHandshake(client: string) {
    this.debug(`[Socket Server] - Handshake received from: ${client}`);
    this.handshakeListeners.forEach(func => func(client));
  }

  private sendRawMessage(msg: SocketMessage) {
    this.connect();
    this.connection.next(msg);
  }

  public sendMessage(message: any) {
    this.sendRawMessage({ type: 'message', direction: 'outbound', message });
  }

  public sendHandshake(clientType: string) {
    this.sendRawMessage({ type: 'handshake', direction: 'outbound', message: clientType });
  }

  public disconnect(clientType: string) {
    this.debug('[Socket Server] - Disconnect');
    // Send peer disconnect message
    this.sendRawMessage({ type: 'peerDisconnect', direction: 'outbound', message: clientType });
    // Reset the instance
    this.messageListeners = [];
    this.errorListeners = [];
    this.closedListeners = [];
    this.connectListeners = [];
    this.handshakeListeners = [];
    this.peerDisconnectListeners = [];
    this.retryAttempts = 0;
          
    clearTimeout(this.pingTimeout);
    clearTimeout(this.reconnectInterval);
    // Disconnect the socket connection.
    this.connection.complete();
    delete this.connection;
    this.connected = false;  
  }

  private debug(...args: any) {
    if(DEBUG) {
      console.debug(...args);
    }
  }

}