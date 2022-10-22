import { Injectable } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';

const SOCKET_URL = 'ws://192.168.50.66:8080';
const HEARTBEAT_INTERVAL = 30000 // 30 Seconds
const RECONNECT_INTERVAL = 30000; // 30 Seconds
const RECONNECT_ATTEMPTS = 10;

interface SocketMessage {
    message?: any;
    direction: 'inbound' | 'outbound';
    type: 'message' | 'ping';
}

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private connection = webSocket(SOCKET_URL);

    // Service Listeners
    private messageListeners: Function[] = [];
    private errorListeners: Function[] = [];
    private closedListeners: Function[] = [];

    private pingTimeout: any;
    private reconnectInterval: any;
    private retryAttempts = 0;
    private connected = false;

    constructor() {
        this.connect();
        setTimeout(() => !this.connected ? this.retry() : null, RECONNECT_INTERVAL);
    }

    // Timeout function for heartbeat.
    private heartbeat() {
        if (!this.connected) {
            console.debug('[Socket Service] - Reconnected.');
        }
        console.debug('-heartbeat-');
        clearTimeout(this.pingTimeout);
        clearTimeout(this.reconnectInterval);
        this.retryAttempts = 0;
        this.connected = true;
    
        this.pingTimeout = setTimeout(() => {
            console.debug('[Socket Service] - Connection timed out.');
            this.connection.complete();
            this.connected = false;
            this.retry();
        }, HEARTBEAT_INTERVAL + 1000);
    }

    private retry() {
        clearTimeout(this.reconnectInterval);
        this.retryAttempts++;
        if (this.retryAttempts <= RECONNECT_ATTEMPTS) {
            console.debug(`[Socket Service] - Attempting reconnect (attempt ${this.retryAttempts} of ${RECONNECT_ATTEMPTS}).`)
            this.connectClient(true);
            this.reconnectInterval = setTimeout(() => this.retry(), RECONNECT_INTERVAL);
        } else {
            console.debug('[Socket Service] - Unable to reconnect.');
        }
    }

    // Handle client connect.
    private connectClient(retry = false) {
        if (!retry) {
            console.debug('[Socket Service] - Connecting to the socket server.');
        }

        this.connection = webSocket(SOCKET_URL);

        this.connection.subscribe({
            next: msg => this.onRawMessageReceived(<SocketMessage>msg), // Called whenever there is a message from the server.
            error: err => {
                console.debug('[Socket Service] - Error caught:', err);
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
        if (msg.direction === 'inbound') {
            if (!this.connected) {
                this.heartbeat();
            }
        }
        
        if (msg.type !== 'ping') {
            console.debug('[Socket Service] - Message Recieved.', msg);
        }
        
        if(msg?.direction === 'inbound' && msg?.type === 'message') {
            this.messageListeners.forEach(func => func(msg?.message));
        } /*else if (msg.type === 'ping') {
            this.heartbeat();
        }*/
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

    private fireOnClosed() {
        console.debug('[Socket Server] - Connection closed');
        clearTimeout(this.pingTimeout);
        this.closedListeners.forEach(func => func());
    }

    public sendMessage(message: any) {
        this.connectClient()
        this.connection.next({ type: 'message', direction: 'outbound', message });
    }

};