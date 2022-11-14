import { createReducer, on } from '@ngrx/store';
import * as PreferencesActions from '../actions/preferences.actions';
import { Preferences } from '../models/preferences.model';

export const preferencesFeatureKey = 'preferences';

export const initialState: Preferences = {
  lastUpdated: false,
  items: []
};

export const preferencesReducer = createReducer(
  initialState,
  on(PreferencesActions.getPreferencesSuccess, (state, action) => ({ ...action.preferences })),
  on(PreferencesActions.setPreferencesSuccess, (state, action) => ({ ...action.preferences }))
);