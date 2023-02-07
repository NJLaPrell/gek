import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { faCircleChevronLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { selectPageTitle } from './state/selectors/navState.selectors';
import { selectConnected, selectPeerConnected, selectRemoteMode } from './state/selectors/remote.selectors';
import { selectLastRun } from './state/selectors/history.selectors';
import { map, skipWhile } from 'rxjs';
import { selectAuthenticated } from './state/selectors/auth.selectors';
import { selectStickypPlaylistPreference } from './state/selectors/preferences.selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Font Awesome
  faCircleChevronLeft = faCircleChevronLeft;
  faAngleRight = faAngleRight;

  pageTitle = '';
  showSidebar = true;
  lastUpdated = 0;
  routed = false;
  authenticated = false;

  mode = '';
  connected = false;
  peerConnected = false;
  stickyPlaylist = true;
  screenHeight = 0;
  screenWidth = 0;

  constructor(
    private store: Store,
    private router: Router
  ) {
    this.store.select(selectStickypPlaylistPreference).subscribe((sticky: boolean) => this.stickyPlaylist = sticky);
    this.getScreenSize();
  }

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
    this.store.select(selectAuthenticated).pipe(
      skipWhile(auth => typeof auth === 'undefined'),
      map(auth => Boolean(auth)),
    ).subscribe(auth => this.authenticated = auth);
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?: any) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    console.log(this.screenHeight, this.screenWidth, event);
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

  navigatePlaylist(): void {
    if (!this.stickyPlaylist || this.screenWidth <= 400) {
      this.toggleSidebar();
    }
  }

}
