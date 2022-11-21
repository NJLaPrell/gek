import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NavState } from '../models/navState.model';
import * as fromNavState from '../reducers/navState.reducer';


export const selectNavState = createFeatureSelector<NavState>(
  fromNavState.navStateFeatureKey
);

export const selectPageTitle = createSelector(
  selectNavState,
  (state) => state.pageTitle
);
