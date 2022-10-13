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
import { authReducer } from './state/reducers/auth.reducer';
import { metaReducers, reducers } from './state';
import { InitializerService } from './initializer.service';
import { HttpClientModule } from '@angular/common/http';

export const initApp = (provider: InitializerService) => () => provider.init();

@NgModule({
  declarations: [
    AppComponent
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
      PlaylistsEffects
    ]),
    HttpClientModule,
    
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


