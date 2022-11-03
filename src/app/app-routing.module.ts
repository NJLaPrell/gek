import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectingComponent } from './connecting/connecting.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { ViewerComponent } from './playlist/viewer/viewer.component';
import { IsAuthenticatedGuard } from './is-authenticated-guard';

const routes: Routes = [
  { path: 'playlist/:playlistId', component: PlaylistComponent, canActivate: [IsAuthenticatedGuard] },
  { path: 'playlist/:playlistId/video/:videoId', component: PlaylistComponent, canActivate: [IsAuthenticatedGuard] },
  { path: 'connecting', component: ConnectingComponent, canActivate: [IsAuthenticatedGuard] },
  { path: 'viewer', component: ViewerComponent, canActivate: [IsAuthenticatedGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
