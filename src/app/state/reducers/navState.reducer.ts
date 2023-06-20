import { createReducer, on } from '@ngrx/store';
import * as NavStateActions from '../actions/navState.actions';
import { initialNavState, NavStateHelper } from '../models/navState.model';

export const navStateFeatureKey = 'navstate';

export const navStateReducer = createReducer(
  initialNavState,
  on(NavStateActions.setNavState, (state, action) => ({ ...new NavStateHelper({ ...action.props }).get() })),
  on(NavStateActions.getNavState, state => ({ ...state }))
);
