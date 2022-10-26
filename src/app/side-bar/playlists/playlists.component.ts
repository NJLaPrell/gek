import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { Playlist } from 'src/app/state/models/list.model';
import { Router } from '@angular/router';
import { selectNavState } from 'src/app/state/selectors/navState.selectors';
import { selectRemoteMode } from 'src/app/state/selectors/remote.selectors';
import { selectLists } from 'src/app/state/selectors/list.selectors';


@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss']
})
export class PlaylistsComponent implements OnInit {
  faList = faList;

  playlists: Playlist[] = [];
  selectedPlaylist: string = '';
  playlistCounts: { [key: string]: { new: number; total: number } } = {};
  videoRoute = 'player';

  @Output() onPageTitleChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private store: Store,
    private router: Router
  ) {
  
  }

  ngOnInit(): void {
    this.store.select(selectLists).pipe().subscribe(l => this.playlists = [...l]);
    this.store.select(selectNavState).subscribe(n => this.selectedPlaylist = n.playlistId);
    this.store.select(selectRemoteMode).subscribe(m => this.videoRoute = m === 'remote' ? 'remote' : 'player');
  }

  onPlaylistClicked(playlistId: string): void {
    this.router.navigate(['/', this.videoRoute, playlistId]);
  }

}
