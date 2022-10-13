import { createFeatureSelector, createSelector } from "@ngrx/store";
import { Playlists } from "../models/playlist.model";
import * as fromPlaylists from '../reducers/playlist.reducer';


export const selectPlaylistState = createFeatureSelector<Playlists>(
    fromPlaylists.playlistFeatureKey
);

export const selectPlaylists = createSelector(
    selectPlaylistState,
    (state) => state
)