import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlayerComponent } from './player/player.component';
import { ConnectingComponent } from './connecting/connecting.component';
import { RemoteComponent } from './remote/remote.component';
import { ViewerComponent } from './viewer/viewer.component';

const routes: Routes = [
  { path: '', redirectTo: 'player', pathMatch: 'full'},
  { path: 'connecting', component: ConnectingComponent },
  { path: 'viewer', component: ViewerComponent },
  { path: 'remote', component: RemoteComponent },
  { path: 'remote/:playlistId', component: RemoteComponent },
  { path: 'remote/:playlistId/:videoId', component: RemoteComponent },
  { path: 'player', component: PlayerComponent },
  { path: 'player/:playlistId', component: PlayerComponent },
  { path: 'player/:playlistId/:videoId', component: PlayerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
