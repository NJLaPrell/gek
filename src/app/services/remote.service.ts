import { Injectable } from "@angular/core";
import { RemoteCommand, RemoteCommandAck, RemoteConnectAck } from "../state/models/remote.model";
import {  SocketService } from "./socket.service";
import { Store } from "@ngrx/store";
import * as Actions from '../state/actions/remote.actions';

const HANDSHAKE_INTERVAL = 5000;
const DEBUG = false;

@Injectable({
    providedIn: 'root'
})
export class RemoteService {
    public clientType: 'remote' | 'viewer' = 'viewer';
    public handshakeTimeout: any;
    private peer = false;

    constructor(
       private socket: SocketService,
       private store: Store
    ) {
        
    }

    public initializeSocketConnection(clientType: 'remote' | 'viewer') {
        this.peer = false;
        this.debug(`[Remote Service] - Init socket connect (${clientType}).`);
        this.clientType = clientType;
        this.socket.onConnect(() => this.store.dispatch(Actions.connectionEstablished({ clientType })));
        this.socket.onHandshake((clientType: 'remote' | 'viewer') => clientType !== this.clientType && !this.peer ? this.store.dispatch(Actions.receivedHandshake({ clientType })) : null);
        this.socket.onPeerDisconnect((clientType: 'remote' | 'viewer') => this.store.dispatch(Actions.peerDisconnected({ clientType })))
        this.socket.onMessageReceived((msg: any) => {
            this.debug('message received', msg, msg?.type, msg?.command?.client);
            if(msg?.type === 'command' && msg?.command?.client === this.clientType) {
                this.debug(`[Remote Service] - Received Command.`, msg);
                this.store.dispatch(Actions.receivedCommand({ ...msg.command }));
            } else if (msg.message?.type === 'commandAck') {
                this.store.dispatch(Actions.receivedCommandAck({ id: msg.message.id, clientType: msg.message.clientType }));
            }
        });
        this.socket.connect();
    }

    public sendHandshake() {
        this.socket.sendHandshake(this.clientType);
        clearTimeout(this.handshakeTimeout);
        this.handshakeTimeout = setTimeout(() => this.sendHandshake(), HANDSHAKE_INTERVAL);
    }

    public sendCommand(command: RemoteCommand) {
        this.debug(`[Remote Service] - Send Command.`, command);
        this.socket.sendMessage({ type: 'command', command });
    }

    public sendCommandAck(ack: RemoteCommandAck) {
        this.socket.sendMessage({ type: 'commandAck', id: ack.id, clientType: this.clientType });
    }

    public sendConnectAck(ack: RemoteConnectAck) {

    }

    public disconnect() {
        this.socket.disconnect(this.clientType);
        this.peer = false;
    }
    
    public peerConnected() {
        clearTimeout(this.handshakeTimeout);
        this.socket.sendHandshake(this.clientType);
        this.peer = true;
    }

    private debug(...args: any) {
        if(DEBUG) {
            console.debug(...args);
        }
    }    

}