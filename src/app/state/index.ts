import { ActionReducerMap, MetaReducer } from "@ngrx/store";
import * as fromAuth from './reducers/auth.reducer';
import * as fromPlaylist from './reducers/playlist.reducer';
import * as fromVideo from './reducers/video.reducer';

export interface AppState {
    [fromAuth.authFeatureKey]: any;
    [fromPlaylist.playlistFeatureKey]: any;
    [fromVideo.videoFeatureKey]: any;
};

export const reducers: ActionReducerMap<AppState> = {
    [fromAuth.authFeatureKey]: fromAuth.authReducer,
    [fromPlaylist.playlistFeatureKey]: fromPlaylist.playlistReducer,
    [fromVideo.videoFeatureKey]: fromVideo.videoReducer
};

export const metaReducers: MetaReducer<AppState>[] = [];