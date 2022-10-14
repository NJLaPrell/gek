import { Action, createReducer, on } from '@ngrx/store';
import * as PlaylistActions from '../actions/playlist.actions';
import { Playlists, PlaylistsHelper } from '../models/playlist.model';

export const playlistFeatureKey = 'playlists';

export const initialState: Playlists = {
    lastUpdated: false,
    items: []
};

export const playlistReducer = createReducer(
    initialState,
    on(PlaylistActions.getPlaylists, state => ({ ...initialState })),
    on(PlaylistActions.getPlaylistsFail, state => ({ ...initialState })),
    on(PlaylistActions.getPlaylistsSuccess, (state, action) => ({ ...(new PlaylistsHelper(action.response).get()) }))
  );