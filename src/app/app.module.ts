import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './state/effects/auth.effects';
import { VideoEffects } from './state/effects/video.effects';
import { HistoryEffects } from './state/effects/history.effects';
import { RulesEffects } from './state/effects/rules.effects';
import { NotificationEffects } from './state/effects/notification.effects';
import { NavStateEffects } from './state/effects/navState.effects';
import { RemoteEffects } from './state/effects/remote.effects';
import { ListEffects } from './state/effects/list.effects';
import { PreferencesEffects } from './state/effects/preferences.effects';
import { metaReducers, reducers } from './state';
import { InitializerService } from './initializer.service';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TopBarComponent } from './top-bar/top-bar.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { PlayerComponent } from './playlist/player/player.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlaylistsComponent } from './side-bar/playlists/playlists.component';
import { YouTubePlayerModule } from '@angular/youtube-player';
import {
  SafeHtmlPipe, DurationFromIsoPipe, FromNowPipe, ViewCountPipe, ThumbCountPipe,
  DurationFromSeconds, TimeAgoPipe } from './pipes';
import { UnsortedComponent } from './modals/unsorted/unsorted.component';
import { RulesListComponent } from './modals/rules-list/rules-list.component';
import { ConfirmPromptComponent } from './modals/confirm-prompt/confirm-prompt.component';
import { ToastContainerComponent } from './toast-container/toast-container.component';
import { SortProgressComponent } from './modals/sort-progress/sort-progress.component';
import { ConnectingComponent } from './connecting/connecting.component';
import { ViewerComponent } from './playlist/viewer/viewer.component';
import { RemoteComponent } from './playlist/remote/remote.component';
import { VideoListComponent } from './playlist/video-list/video-list.component';
import { PlayerControlsComponent } from './playlist/player-controls/player-controls.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { VideoEmbedComponent } from './playlist/video-embed/video-embed.component';
import { PreferencesComponent } from './modals/preferences/preferences.component';
import { CustomInterceptor } from './http-interceptor';
import { CoolSocialLoginButtonsModule } from '@angular-cool/social-login-buttons';
import { HomeComponent } from './home/home.component';
import { PrivacyPolicyComponent } from './legal/privacy-policy/privacy-policy.component';
import { FooterComponent } from './footer/footer.component';
import { LegalComponent } from './modals/legal/legal.component';
import { DeleteDataComponent } from './legal/delete-data/delete-data.component';

export const initApp = (provider: InitializerService) => () => provider.init();

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    SideBarComponent,
    PlayerComponent,
    PlaylistsComponent,
    SafeHtmlPipe,
    DurationFromIsoPipe,
    FromNowPipe,
    ViewCountPipe,
    ThumbCountPipe,
    DurationFromSeconds,
    TimeAgoPipe,
    UnsortedComponent,
    RulesListComponent,
    ConfirmPromptComponent,
    ToastContainerComponent,
    SortProgressComponent,
    ConnectingComponent,
    ViewerComponent,
    RemoteComponent,
    VideoListComponent,
    PlayerControlsComponent,
    PlaylistComponent,
    VideoEmbedComponent,
    PreferencesComponent,
    HomeComponent,
    PrivacyPolicyComponent,
    FooterComponent,
    LegalComponent,
    DeleteDataComponent
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
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: false }),
    EffectsModule.forRoot([
      AuthEffects,
      VideoEffects,
      HistoryEffects,
      RulesEffects,
      NotificationEffects,
      NavStateEffects,
      RemoteEffects,
      ListEffects,
      PreferencesEffects
    ]),
    HttpClientModule,
    NgbModule,
    FontAwesomeModule,
    YouTubePlayerModule,
    FormsModule,
    HttpClientXsrfModule,
    CoolSocialLoginButtonsModule
  ],
  providers: [
    InitializerService, {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [InitializerService],
      multi: true
    },
    { provide: HTTP_INTERCEPTORS, useClass: CustomInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


