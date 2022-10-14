import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { Playlists } from 'src/app/state/models/playlist.model';
import { selectPlaylists } from '../../state/selectors/playlists.selectors';
import { initialState } from 'src/app/state/reducers/playlist.reducer';
import { Router } from '@angular/router';


@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss']
})
export class PlaylistsComponent implements OnInit {
  faList = faList;

  playlists: Playlists;

  @Output() onPageTitleChange: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private store: Store,
    private router: Router
  ) {
    this.playlists = initialState;
  }

  ngOnInit(): void {
    this.store.select(selectPlaylists).pipe().subscribe(r => this.playlists = Object.assign({}, r));
  }

  onPlaylistClicked(playlistId: string, playlistTitle: string): void {
    this.onPageTitleChange.emit(playlistTitle);
    this.router.navigate(['/', 'player', playlistId]);
  }

}
