import { ActionReducerMap, MetaReducer } from "@ngrx/store";
import * as fromAuth from './reducers/auth.reducer';
import * as fromPlaylist from './reducers/playlist.reducer';

export interface AppState {
    [fromAuth.authFeatureKey]: any;
    [fromPlaylist.playlistFeatureKey]: any;
};

export const reducers: ActionReducerMap<AppState> = {
    [fromAuth.authFeatureKey]: fromAuth.authReducer,
    [fromPlaylist.playlistFeatureKey]: fromPlaylist.playlistReducer
};

export const metaReducers: MetaReducer<AppState>[] = [];