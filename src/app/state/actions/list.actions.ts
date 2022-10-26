import { createAction, props } from '@ngrx/store';
import { Playlist } from '../models/playlist.model';

export const getLists = createAction(
    '[List] Get Lists'
);

export const getListsSuccess = createAction(
    '[List] Get Lists Success',
    props<{ items: Playlist[] }>()
);

export const getListsFail = createAction(
    '[List] Get Lists Fail',
    props<{ error: string }>()
);
