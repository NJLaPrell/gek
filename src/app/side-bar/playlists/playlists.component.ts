import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { Playlists } from 'src/app/state/models/playlist.model';
import { selectPlaylists } from '../../state/selectors/playlists.selectors';
import { initialState } from 'src/app/state/reducers/playlist.reducer';
import { ActivatedRoute, Router } from '@angular/router';


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
    this.activatedRoute.params.subscribe(params => {
      console.log(params);
      this.selectedPlaylist = params['playlistId'];
      console.log(this.selectedPlaylist);
    });
  }

  onPlaylistClicked(playlistId: string, playlistTitle: string): void {
    this.selectedPlaylist = playlistId;
    this.onPageTitleChange.emit(playlistTitle);
    this.router.navigate(['/', 'player', playlistId]);
  }

}
