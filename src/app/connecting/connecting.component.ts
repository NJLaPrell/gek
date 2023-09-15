import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectConnected, selectPeerConnected, selectRemoteMode } from '../state/selectors/remote.selectors';

@Component({
  selector: 'app-connecting',
  templateUrl: './connecting.component.html',
  styleUrls: ['./connecting.component.scss'],
})
export class ConnectingComponent {
  connected = false;
  peerConnected = false;
  mode = '';

  constructor(private store: Store) {
    this.store.select(selectRemoteMode).subscribe(m => (this.mode = m));
    this.store.select(selectConnected).subscribe(c => (this.connected = c));
    this.store.select(selectPeerConnected).subscribe(() => this.peerConnected);
  }
}
