import { createReducer, on } from '@ngrx/store';
import * as ListActions from '../actions/list.actions';
import * as VideoActions from '../actions/video.actions';
import { initialListState, Playlist } from '../models/list.model';

export const listFeatureKey = 'list';

export const listReducer = createReducer(
  initialListState,
  on(ListActions.getListsSuccess, (state, action) => {
    const playlistLookup:any = {};
    const items = [...action.items].sort((a, b) => a.title.replace(/\W+/g,'') > b.title.replace(/\W+/g,'') ? 1 : -1);
    items.forEach((i: Playlist) => playlistLookup[i.playlistId || 1] = i.title);
    return {
      ...state,
      items,
      playlistLookup 
    };
  }),
  on(VideoActions.getPlaylistVideosSuccess, (state, action) => {
    const ix = state.items.findIndex((pl: Playlist) => pl.playlistId === action.playlistId);
    const playlists: Playlist[] = [...state.items];
    
    playlists[ix] = { ...playlists[ix], videos: [ ...action.response ] };
    return {
      ...state,
      items: playlists
    };
  }),
  on(ListActions.getSubscriptionsSuccess, (state, action) => ({ ...state, subscriptions: action.response.items })),
  on(ListActions.getListsFail, state => ({ ...initialListState })),
  on(ListActions.removePlaylistItem, (state, action) =>({ 
    ...state, 
    items: state.items.map(pl => ({
      ...pl,
      itemCount: pl.videos?.filter(v => v.playlistItemId !== action.playlistItemId).length,
      newItemCount: pl.videos?.filter(v => new Date(v.publishedAt || '').getTime() > (Date.now() - 86400000) && v.playlistItemId !== action.playlistItemId).length,
      videos: pl.videos?.filter(v => v.playlistItemId !== action.playlistItemId)
    }))
  }))
);