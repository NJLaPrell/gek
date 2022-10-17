import { createReducer, on } from '@ngrx/store';
import * as HistoryActions from '../actions/history.actions';
import { initialHistoryState } from '../models/history.model';

export const historyFeatureKey = 'history';

export const historyReducer = createReducer(
    initialHistoryState,
    on(HistoryActions.getHistoryFail, state => ({ ...state })),
    on(HistoryActions.getHistorySuccess, (state, action) => ({ ...action.response }))
);