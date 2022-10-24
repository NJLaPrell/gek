import { Injectable } from "@angular/core";
import { RemoteCommand, RemoteCommandAck, RemoteConnectAck } from "../state/models/remote.model";
import { SocketMessage, SocketService } from "./socket.service";
import { Store } from "@ngrx/store";
import * as Actions from '../state/actions/remote.actions';


@Injectable({
    providedIn: 'root'
})
export class RemoteService {
    public clientType: 'remote' | 'viewer' = 'viewer';

    constructor(
       private socket: SocketService,
       private store: Store
    ) {
        
    }

    public initializeSocketConnection(clientType: 'remote' | 'viewer') {
        console.log('[Remote Service] - Init socket connect.');
        this.clientType = clientType;
        this.socket.onConnect(() => this.store.dispatch(Actions.connectionEstablished({ clientType })));
        this.socket.onHandshake((clientType: 'remote' | 'viewer') => clientType !== this.clientType ? this.store.dispatch(Actions.receivedHandshake({ clientType })) : null);
        this.socket.onPeerDisconnect((clientType: 'remote' | 'viewer') => this.store.dispatch(Actions.peerDisconnected({ clientType })))
        this.socket.onMessageReceived((msg: SocketMessage) => {
            if(msg.message?.type === 'command') {
                Actions.receivedCommand(msg.message.command);
            } else if (msg.message?.type === 'commandAck') {
                Actions.receivedCommandAck(msg.message.id);
            }
        });
        this.socket.connect();
    }

    public sendHandshake() {
        this.socket.sendHandshake(this.clientType);
    }

    public sendCommand(command: RemoteCommand) {
        this.socket.sendMessage({ type: 'command', command });
    }

    public sendCommandAck(ack: RemoteCommandAck) {
        this.socket.sendMessage({ type: 'commandAck', id: ack.id });
    }

    public sendConnectAck(ack: RemoteConnectAck) {

    }

    public disconnect() {
        this.socket.disconnect(this.clientType);
    }
    


    

}