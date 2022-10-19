import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { Playlists } from 'src/app/state/models/playlist.model';
import { selectPlaylists } from '../../state/selectors/playlists.selectors';
import { initialState } from 'src/app/state/reducers/playlist.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { selectNavState } from 'src/app/state/selectors/navState.selectors';


@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss']
})
export class PlaylistsComponent implements OnInit {
  faList = faList;

  playlists: Playlists;
  selectedPlaylist: string = '';

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
  }

  onPlaylistClicked(playlistId: string): void {
    this.router.navigate(['/', 'player', playlistId]);
  }

}
