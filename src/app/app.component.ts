import { Component, Inject } from '@angular/core';
import { Auth } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ytlist';

  constructor(private oauth2Client: OAuth2Client) { }

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
}
