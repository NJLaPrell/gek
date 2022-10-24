import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectConnected, selectPeerConnected, selectRemoteMode, selectRemoteState } from '../state/selectors/remote.selectors';

@Component({
  selector: 'app-connecting',
  templateUrl: './connecting.component.html',
  styleUrls: ['./connecting.component.scss']
})
export class ConnectingComponent implements OnInit {
  connected = false;
  peerConnected = false;
  mode = '';

  constructor(
    private store: Store
  ) { }

  ngOnInit(): void {
    this.store.select(selectRemoteMode).subscribe(m => this.mode = m);

    this.store.select(selectConnected).subscribe(c => this.connected = c);

    this.store.select(selectPeerConnected).subscribe(c => this.peerConnected);
  }

}
