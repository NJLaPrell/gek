import { Component, Inject, OnInit } from '@angular/core';
import { Auth } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectPlaylists } from './state/selectors/playlists.selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ytlist';

  constructor(
    private oauth2Client: OAuth2Client,
    private route: ActivatedRoute,
    private store: Store
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
      console.log('params')
      const code = params['code'];
      console.log(code);
      if (code) {
        this.oauth2Client.getToken(code).then(resp => console.log(resp)).catch(e => console.error(e));
      }
      
    });

    this.store.select(selectPlaylists).pipe().subscribe(r => console.log(r));

    
  };

  doAuth = () => {
    window.location.href = this.oauth2Client.generateAuthUrl({
      // 'offline' also gets refresh_token  
        access_type: 'offline',
      // put any scopes you need there, 
        scope: [
          'https://www.googleapis.com/auth/youtube.force-ssl',
          'https://www.googleapis.com/auth/youtube.readonly',
          'https://www.googleapis.com/auth/youtube'
          // in the first example we want to read calendar events
          //'https://www.googleapis.com/auth/calendar.events.readonly',
          //'https://www.googleapis.com/auth/calendar.readonly',
          // in the second example we read analytics data
          //'https://www.googleapis.com/auth/analytics.readonly',
        ],
      });
  }

  logOauth() {
    console.log(this.oauth2Client);
  }
}
