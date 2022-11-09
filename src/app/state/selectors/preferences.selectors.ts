import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Preferences } from '../models/preferences.model';
import * as fromPreferences from '../reducers/preferences.reducer';


export const preferencesState = createFeatureSelector<Preferences>(
  fromPreferences.preferencesFeatureKey
);

export const selectPreferences = createSelector(
  preferencesState,
  (state) => state.items
);

export const selectPreferencesDate = createSelector(
  preferencesState,
  (state) => state.lastUpdated
);
