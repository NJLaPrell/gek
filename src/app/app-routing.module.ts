import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectingComponent } from './connecting/connecting.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { ViewerComponent } from './playlist/viewer/viewer.component';

const routes: Routes = [
  { path: 'playlist/:playlistId', component: PlaylistComponent },
  { path: 'playlist/:playlistId/video/:videoId', component: PlaylistComponent },
  { path: 'connecting', component: ConnectingComponent },
  { path: 'viewer', component: ViewerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
