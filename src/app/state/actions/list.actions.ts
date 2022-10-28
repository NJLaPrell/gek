import { createAction, props } from '@ngrx/store';
import { GetSubscriptionsResponse, Playlist } from '../models/list.model';

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

export const getSubscriptions = createAction(
    '[List] Get Subscriptions'
);

export const getSubscriptionsSuccess = createAction(
    '[List] Get Subscriptions Success',
    props<{ response: GetSubscriptionsResponse }>()
);

export const getSubscriptionsFail = createAction(
    '[List] Get Subscriptions Fail',
    props<{ error: string }>()
);
