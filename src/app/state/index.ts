import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import * as fromAuth from './reducers/auth.reducer';
import * as fromHistory from './reducers/history.reducer';
import * as fromRules from './reducers/rules.reducer';
import * as fromNavState from './reducers/navState.reducer';
import * as fromRemoteState from './reducers/remote.reducer';
import * as fromListState from './reducers/list.reducer';
import * as fromPreferences from './reducers/preferences.reducer';

export interface AppState {
  [fromAuth.authFeatureKey]: any;
  [fromHistory.historyFeatureKey]: any;
  [fromRules.rulesFeatureKey]: any;
  [fromNavState.navStateFeatureKey]: any;
  [fromRemoteState.remoteFeatureKey]: any;
  [fromListState.listFeatureKey]: any;
  [fromPreferences.preferencesFeatureKey]: any;
}

export const reducers: ActionReducerMap<AppState> = {
  [fromAuth.authFeatureKey]: fromAuth.authReducer,
  [fromHistory.historyFeatureKey]: fromHistory.historyReducer,
  [fromRules.rulesFeatureKey]: fromRules.rulesReducer,
  [fromNavState.navStateFeatureKey]: fromNavState.navStateReducer,
  [fromRemoteState.remoteFeatureKey]: fromRemoteState.remoteReducer,
  [fromListState.listFeatureKey]: fromListState.listReducer,
  [fromPreferences.preferencesFeatureKey]: fromPreferences.preferencesReducer,
};

export const metaReducers: MetaReducer<AppState>[] = [];
