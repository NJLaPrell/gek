import { Injectable } from '@angular/core';
import { RemoteCommand } from '../state/models/remote.model';
import { SocketService } from './socket.service';
import { Store } from '@ngrx/store';
import * as Actions from '../state/actions/remote.actions';
import { environment } from '../../environments/environment';

const DEBUG = environment.debug.remoteService;

@Injectable({
  providedIn: 'root',
})
export class RemoteService {
  public clientType: 'remote' | 'viewer' | 'player' = 'viewer';
  public userId!: string;
  public handshakeTimeout: any;
  private peer = false;

  constructor(private socket: SocketService, private store: Store) {}

  public initializeSocketConnection(clientType: 'remote' | 'viewer' | 'player', userId: string) {
    this.peer = false;
    this.debug(`[Remote Service] - Init socket connect (${clientType}).`);
    this.clientType = clientType;
    this.userId = userId;
    this.socket.onConnect(() => {
      this.store.dispatch(Actions.connectionEstablished({ clientType }));
      this.socket.sendHandshake(this.userId, this.clientType);
    });
    this.socket.onHandshake((payload: { clientType: 'remote' | 'viewer' | 'player'; clientId: string }) =>
      payload.clientType !== this.clientType && !this.peer ? this.store.dispatch(Actions.receivedHandshake({ clientType: payload.clientType })) : null
    );
    this.socket.onPeerDisconnect(() => {
      this.store.dispatch(Actions.peerDisconnected());
      this.socket.sendHandshake(this.userId, this.clientType);
    });
    this.socket.onDisconnect(() => this.store.dispatch(Actions.clientDisconnected()));
    this.socket.onReconnect(() => this.socket.sendHandshake(this.userId, this.clientType));
    this.socket.onMessageReceived((msg: any) => {
      this.debug('message received', msg, msg?.type, msg?.command?.client);
      if (msg?.type === 'command' && msg?.command?.client === this.clientType) {
        this.debug('[Remote Service] - Received Command.', msg);
        this.store.dispatch(Actions.receivedCommand({ ...msg.command }));
      }
    });
    this.socket.connect();
  }

  public sendCommand(command: RemoteCommand) {
    this.debug('[Remote Service] - Send Command.', command);
    this.socket.sendMessage({ type: 'command', command });
  }

  public disconnect() {
    this.socket.disconnect();
    this.peer = false;
  }

  public peerConnected() {
    this.peer = true;
  }

  private debug(...args: any) {
    if (DEBUG) {
      console.debug(...args);
    }
  }
}
