import { createReducer, on } from '@ngrx/store';
import * as AuthActions from '../actions/auth.actions';
import { AuthState } from '../models/auth.model';

export const authFeatureKey = 'auth';

export const initialState: AuthState = {
  authenticated: false,
  userId: false
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.getAuthStateSuccess, (state, action) => ({ ...action.authState })),
  on(AuthActions.getAuthStateFail, () => (initialState))
);