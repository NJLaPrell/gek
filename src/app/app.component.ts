import { Component, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { faCircleChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { selectPageTitle } from './state/selectors/navState.selectors';
import { selectConnected, selectPeerConnected, selectRemoteMode } from './state/selectors/remote.selectors';
import { selectLastRun } from './state/selectors/history.selectors';
import { skipWhile } from 'rxjs';
import { selectAuthenticated } from './state/selectors/auth.selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  faCircleChevronLeft = faCircleChevronLeft;

  pageTitle = '';
  showSidebar = true;
  lastUpdated = 0;
  routed = false;
  authenticated = false;

  mode = '';
  connected = false;
  peerConnected = false;

  constructor(
    private store: Store,
    private router: Router
  ) { }

  ngOnInit() {
    this.store.select(selectPageTitle).pipe(skipWhile(t => !t || t === 'undefined')).subscribe(t => this.pageTitle = t);
    this.store.select(selectRemoteMode).subscribe(m => this.mode = m);
    this.store.select(selectConnected).subscribe(c => {
      const disconnect = this.connected && this.peerConnected && !c;
      this.connected = c;
      this.connectionChanged(disconnect);
      
    });
    this.store.select(selectPeerConnected).subscribe(c => {
      const disconnect = this.connected && this.peerConnected && !c;
      this.peerConnected = c;
      this.connectionChanged(disconnect);
      
      
    }); 
    this.store.select(selectLastRun).subscribe(t => this.lastUpdated = t);
    this.store.select(selectAuthenticated).subscribe(auth => this.authenticated = auth);
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  connectionChanged(disconnect: boolean) {
    if (this.connected && this.peerConnected) {
      if (this.mode === 'viewer') {
        this.router.navigate(['/', 'viewer']);
      } else {
        this.router.navigate(['']);
      }
    } else if ((this.connected || this.peerConnected) && !disconnect) {
      this.router.navigate(['/', 'connecting']);
    }
  }

  signIn(): void {
    window.location.href='/login';
  }
}
