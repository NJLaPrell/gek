import { createFeatureSelector, createSelector } from "@ngrx/store";
import { HistoryState } from "../models/history.model";
import * as fromHistory from '../reducers/history.reducer';


export const selectHistoryState = createFeatureSelector<HistoryState>(
    fromHistory.historyFeatureKey
);

export const selectHistory = createSelector(
    selectHistoryState,
    (state) => state
);

export const selectErrorQueue = createSelector(
    selectHistoryState,
    (state) => state.errorQueue
);

export const selectUnsorted = createSelector(
    selectHistoryState,
    (state) => state.unsorted
);
