import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';
import { OAuth2Client } from 'google-auth-library';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [{
    provide: OAuth2Client,
    useValue: new OAuth2Client(
    // You get this in GCP project credentials
      environment.G_API_CLIENT_ID,
      environment.G_API_CLIENT_SECRET,
    // URL where you'll handle succesful authentication
      environment.G_API_REDIRECT,
    ),
  },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


