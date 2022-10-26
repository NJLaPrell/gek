import { Action, createReducer, on } from '@ngrx/store';
import * as ListActions from '../actions/list.actions';
import { Playlists, PlaylistsHelper } from '../models/playlist.model';
import { initialListState } from '../models/list.model';

export const listFeatureKey = 'list';

export const listReducer = createReducer(
    initialListState,
    on(ListActions.getListsSuccess, (state, action) => ({ items: action.items })),
    on(ListActions.getListsFail, state => ({ ...initialListState }))
  );