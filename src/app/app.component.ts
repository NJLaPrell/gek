import { Component, OnInit } from '@angular/core';
import { OAuth2Client } from 'google-auth-library';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { faCircleChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { selectPageTitle } from './state/selectors/navState.selectors';
import { selectConnected, selectPeerConnected, selectRemoteMode } from './state/selectors/remote.selectors';
import { selectLastRun } from './state/selectors/history.selectors';
import { skipWhile } from 'rxjs';

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

  mode = '';
  connected = false;
  peerConnected = false;

  constructor(
    private oauth2Client: OAuth2Client,
    private route: ActivatedRoute,
    private store: Store,
    private router: Router
  ) { }

  ngOnInit() {

    
    this.oauth2Client.on('tokens', (tokens) => {
      console.log('TOKENS');
      if (tokens.refresh_token) {
        console.log(tokens.refresh_token);
      }
      console.log(tokens.access_token);
    });

    this.route.queryParams.subscribe(params => {
      const code = params['code'];

      if (code) {
        this.oauth2Client.getToken(code).then(resp => console.log(resp)).catch(e => console.error(e));
        //this.router.navigate(['']);
      }
      
    });

    this.store.select(selectPageTitle).pipe(skipWhile(t => !t || t === 'undefined')).subscribe(t => this.pageTitle = t);
    this.store.select(selectRemoteMode).subscribe(m => this.mode = m);
    this.store.select(selectConnected).subscribe(c => {
      this.connected = c;
      this.connectionChanged();
    });
    this.store.select(selectPeerConnected).subscribe(c => {
      this.peerConnected = c;
      this.connectionChanged();
    }); 
    this.store.select(selectLastRun).subscribe(t => this.lastUpdated = t);
  }

  doAuth = () => {
    window.location.href = this.oauth2Client.generateAuthUrl({
      // 'offline' also gets refresh_token  
      access_type: 'offline',
      // put any scopes you need there, 
      scope: [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
        'https://www.googleapis.com/auth/youtube.force-ssl',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtubepartner',
        'https://www.googleapis.com/auth/youtubepartner-channel-audit',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'openid'
        // in the first example we want to read calendar events
        //'https://www.googleapis.com/auth/calendar.events.readonly',
        //'https://www.googleapis.com/auth/calendar.readonly',
        // in the second example we read analytics data
        //'https://www.googleapis.com/auth/analytics.readonly',
      ],
    });
  };

  logOauth() {
    console.log(this.oauth2Client);
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  connectionChanged() {
    if (this.connected && this.peerConnected) {
      if (this.mode === 'viewer') {
        this.router.navigate(['/', 'viewer']);
      } else {
        this.router.navigate(['']);
      }
    } else if (this.connected || this.peerConnected) {
      this.router.navigate(['/', 'connecting']);
    }
  }
}
