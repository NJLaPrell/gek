import { createAction, props } from '@ngrx/store';
import { PlaylistResponse } from '../models/playlist.model';

export const getPlaylists = createAction(
  '[Playlist] Get Playlists'
);

export const getPlaylistsSuccess = createAction(
    '[Playlist] Get Playlists Success',
    props<{ response: PlaylistResponse }>()
);

export const getPlaylistsFail = createAction(
    '[Playlist] Get Playlists Fail',
    props<{ error: string }>()
);
