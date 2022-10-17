import { ActionReducerMap, MetaReducer } from "@ngrx/store";
import * as fromAuth from './reducers/auth.reducer';
import * as fromPlaylist from './reducers/playlist.reducer';
import * as fromVideo from './reducers/video.reducer';
import * as fromHistory from './reducers/history.reducer';

export interface AppState {
    [fromAuth.authFeatureKey]: any;
    [fromPlaylist.playlistFeatureKey]: any;
    [fromVideo.videoFeatureKey]: any;
    [fromHistory.historyFeatureKey]: any;
};

export const reducers: ActionReducerMap<AppState> = {
    [fromAuth.authFeatureKey]: fromAuth.authReducer,
    [fromPlaylist.playlistFeatureKey]: fromPlaylist.playlistReducer,
    [fromVideo.videoFeatureKey]: fromVideo.videoReducer,
    [fromHistory.historyFeatureKey]: fromHistory.historyReducer
};

export const metaReducers: MetaReducer<AppState>[] = [];