import { createAction, props } from '@ngrx/store';
import { AuthState } from '../models/auth.model';

export const getAuthState = createAction(
  '[Auth] Get Authentication State'
);

export const getAuthStateFail = createAction(
  '[Auth] Get Authentication State Fail',
  props<{ error: string }>()
);

export const getAuthStateSuccess = createAction(
  '[Auth] Get Authentication State Success',
  props<{ authState: AuthState }>()
);
