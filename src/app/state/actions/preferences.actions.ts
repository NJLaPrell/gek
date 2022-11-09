import { createAction, props } from '@ngrx/store';
import { Preferences } from '../models/preferences.model';

export const getPreferences = createAction(
  '[Preferences] Get Preferences'
);

export const getPreferencesFail = createAction(
  '[Preferences] Get Preferences Fail',
  props<{ error: string }>()
);

export const getPreferencesSuccess = createAction(
  '[Preferences] Get Preferences Success',
  props<{ preferences: Preferences }>()
);

export const setPreferences = createAction(
  '[Preferences] Set Preferences',
  props<Preferences>()
);

export const setPreferencesFail = createAction(
  '[Preferences] Set Preferences Fail',
  props<{ error: string }>()
);

export const setPreferencesSuccess = createAction(
  '[Preferences] Set Preferences Success',
  props<{ message: string }>()
);
