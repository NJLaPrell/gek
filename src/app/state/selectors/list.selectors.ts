import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ListState } from "../models/list.model";
import * as fromList from '../reducers/list.reducer';


export const selectListState = createFeatureSelector<ListState>(
    fromList.listFeatureKey
);

export const selectLists = createSelector(
    selectListState,
    (state) => state.items
);

export const selectPlaylistTitles = createSelector(
    selectListState,
    (state) => state.playlistLookup
)
