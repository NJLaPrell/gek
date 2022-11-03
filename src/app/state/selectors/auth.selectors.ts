import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../models/auth.model';
import * as fromAuthState from '../reducers/auth.reducer';


export const authState = createFeatureSelector<AuthState>(
  fromAuthState.authFeatureKey
);

export const selectAuthState = createSelector(
  authState,
  (state) => state
);

export const selectAuthenticated = createSelector(
  authState,
  (state) => state.authenticated
);
