import { Component, OnInit } from '@angular/core';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { Playlists } from 'src/app/state/models/playlist.model';
import { selectPlaylists } from '../../state/selectors/playlists.selectors';
import { initialState } from 'src/app/state/reducers/playlist.reducer';


@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  styleUrls: ['./playlists.component.scss']
})
export class PlaylistsComponent implements OnInit {
  faList = faList;

  playlists: Playlists;

  constructor(private store: Store) {
    this.playlists = initialState;
  }

  ngOnInit(): void {
    this.store.select(selectPlaylists).pipe().subscribe(r => this.playlists = Object.assign({}, r));
  }

}
