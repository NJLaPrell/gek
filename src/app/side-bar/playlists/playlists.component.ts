import { Component, OnInit } from '@angular/core';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { Playlist } from 'src/app/state/models/list.model';
import { Router } from '@angular/router';
import { selectNavState } from 'src/app/state/selectors/navState.selectors';
import { selectLists } from 'src/app/state/selectors/list.selectors';


@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss']
})
export class PlaylistsComponent {
  faList = faList;

  playlists: Playlist[];
  selectedPlaylist: string;

  constructor(
    private store: Store,
    private router: Router
  ) {
    this.playlists = [];
    this.selectedPlaylist = '';
    this.store.select(selectLists).pipe().subscribe(l => this.playlists = [...l]);
    this.store.select(selectNavState).subscribe(n => setTimeout(() => this.selectedPlaylist = n.playlistId));
  }

  onPlaylistClicked(playlistId: string): void {
    this.router.navigate(['/', 'playlist', playlistId]);
  }

}
