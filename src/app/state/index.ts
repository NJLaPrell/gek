import { ActionReducerMap, MetaReducer } from "@ngrx/store";
import * as fromAuth from './reducers/auth.reducer';
import * as fromPlaylist from './reducers/playlist.reducer';
import * as fromVideo from './reducers/video.reducer';
import * as fromHistory from './reducers/history.reducer';
import * as fromRules from './reducers/rules.reducer';
import * as fromSubscriptions from './reducers/subscriptions.reducer';
import * as fromNavState from './reducers/navState.reducer';

export interface AppState {
    [fromAuth.authFeatureKey]: any;
    [fromPlaylist.playlistFeatureKey]: any;
    [fromVideo.videoFeatureKey]: any;
    [fromHistory.historyFeatureKey]: any;
    [fromRules.rulesFeatureKey]: any;
    [fromSubscriptions.subscriptionsFeatureKey]: any;
    [fromNavState.navStateFeatureKey]: any;
};

export const reducers: ActionReducerMap<AppState> = {
    [fromAuth.authFeatureKey]: fromAuth.authReducer,
    [fromPlaylist.playlistFeatureKey]: fromPlaylist.playlistReducer,
    [fromVideo.videoFeatureKey]: fromVideo.videoReducer,
    [fromHistory.historyFeatureKey]: fromHistory.historyReducer,
    [fromRules.rulesFeatureKey]: fromRules.rulesReducer,
    [fromSubscriptions.subscriptionsFeatureKey]: fromSubscriptions.subscriptionsReducer,
    [fromNavState.navStateFeatureKey]: fromNavState.navStateReducer
};

export const metaReducers: MetaReducer<AppState>[] = [];