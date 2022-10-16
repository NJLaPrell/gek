import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';
import { OAuth2Client } from 'google-auth-library';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { PlaylistsEffects } from './state/effects/playlist.effects';
import { VideoEffects } from './state/effects/video.effects';
import { metaReducers, reducers } from './state';
import { InitializerService } from './initializer.service';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TopBarComponent } from './top-bar/top-bar.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { PlayerComponent } from './player/player.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlaylistsComponent } from './side-bar/playlists/playlists.component';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { ErrorBufferComponent } from './modals/error-buffer/error-buffer.component';
import { SafeHtmlPipe } from './pipes';

export const initApp = (provider: InitializerService) => () => provider.init();

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    SideBarComponent,
    PlayerComponent,
    PlaylistsComponent,
    ErrorBufferComponent,
    SafeHtmlPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot(reducers, { 
      metaReducers,
      runtimeChecks: {
        strictStateSerializability: true,
        strictActionSerializability: true,
        strictActionWithinNgZone: true,
        strictActionTypeUniqueness: true,
        strictStateImmutability: false,
        strictActionImmutability: true
      }
    }),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: false}),
    EffectsModule.forRoot([
      PlaylistsEffects,
      VideoEffects
    ]),
    HttpClientModule,
    NgbModule,
    FontAwesomeModule,
    YouTubePlayerModule
  ],
  providers: [
    {
      provide: OAuth2Client,
      useValue: new OAuth2Client(
      // You get this in GCP project credentials
        environment.G_API_CLIENT_ID,
        environment.G_API_CLIENT_SECRET,
      // URL where you'll handle succesful authentication
        environment.G_API_REDIRECT,
      )
    },
    InitializerService, {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [InitializerService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


