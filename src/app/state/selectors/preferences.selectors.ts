import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Preferences } from '../models/preferences.model';
import * as fromPreferences from '../reducers/preferences.reducer';

export const preferencesState = createFeatureSelector<Preferences>(fromPreferences.preferencesFeatureKey);

export const selectPreferences = createSelector(preferencesState, state => state.items);

export const selectPreferencesDate = createSelector(preferencesState, state => state.lastUpdated);

export const selectAutoNextPreference = createSelector(preferencesState, state => state.items.find(i => i.name === 'autoNext')?.value || false);

export const selectAlmostDonePreference = createSelector(preferencesState, state => state.items.find(i => i.name === 'almostDonePrompt')?.value || false);

export const selectAutoPlayPreference = createSelector(preferencesState, state => state.items.find(i => i.name === 'autoPlay')?.value || false);

export const selectKeepPlaylistPreference = createSelector(preferencesState, state => state.items.find(i => i.name === 'keepPlaylist')?.value || false);

export const selectStickypPlaylistPreference = createSelector(preferencesState, state => state.items.find(i => i.name === 'stickyPlaylist')?.value || false);
