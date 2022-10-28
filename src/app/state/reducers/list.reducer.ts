import { createReducer, on } from '@ngrx/store';
import * as ListActions from '../actions/list.actions';
import { initialListState, Playlist } from '../models/list.model';

export const listFeatureKey = 'list';

export const listReducer = createReducer(
    initialListState,
    on(ListActions.getListsSuccess, (state, action) => {
      let playlistLookup:any = {};
      action.items.forEach((i: Playlist) => playlistLookup[i.playlistId || 1] = i.title);
      return {
        ...state,
        items: [...action.items].sort((a, b) => a.title > b.title ? 1 : -1),
        playlistLookup 
      }
    }),
    on(ListActions.getSubscriptionsSuccess, (state, action) => ({ ...state, subscriptions: action.response.items })),
    on(ListActions.getListsFail, state => ({ ...initialListState }))
  );