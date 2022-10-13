import { Action, createReducer, on } from '@ngrx/store';
import * as AuthActions from '../actions/auth.actions';
import { AuthState } from '../models/auth.model';

export const authFeatureKey = 'auth';

export const initialState: AuthState = {
    authenticated: false
};

export const authReducer = createReducer(
    initialState,
    on(AuthActions.loginSuccess, state => ({ ...state, authenticated: true })),
    on(AuthActions.loginFail, state => ({ authenticated: false })),
    on(AuthActions.getTokenSuccess, (state, action) => ({ ...state, ...action })),
    on(AuthActions.getTokenFail, state => ({ authenticated: false }))
  );