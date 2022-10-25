import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { Playlists } from 'src/app/state/models/playlist.model';
import { selectPlaylists } from '../../state/selectors/playlists.selectors';
import { initialState } from 'src/app/state/reducers/playlist.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { selectNavState } from 'src/app/state/selectors/navState.selectors';
import { selectVideoState } from 'src/app/state/selectors/video.selectors';
import { selectRemoteMode } from 'src/app/state/selectors/remote.selectors';


@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss']
})
export class PlaylistsComponent implements OnInit {
  faList = faList;

  playlists: Playlists;
  selectedPlaylist: string = '';
  playlistCounts: { [key: string]: { new: number; total: number } } = {};
  videoRoute = 'player';

  @Output() onPageTitleChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private store: Store,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.playlists = initialState;
  }

  ngOnInit(): void {
    this.store.select(selectPlaylists).pipe().subscribe(r => this.playlists = Object.assign({}, r));
    this.store.select(selectNavState).subscribe(n => this.selectedPlaylist = n.playlistId);
    this.store.select(selectVideoState).subscribe(vs => Object.keys(vs.playlist).forEach((pl: string) => this.playlistCounts[pl] = {
      new: vs.playlist[pl].filter(p => new Date(p.published) > (new Date(Date.now() - 86400000) )).length,
      total: vs.playlist[pl].length
    }))
    this.store.select(selectRemoteMode).subscribe(m => this.videoRoute = m === 'remote' ? 'remote' : 'player');
  }

  onPlaylistClicked(playlistId: string): void {
    this.router.navigate(['/', this.videoRoute, playlistId]);
  }

}
