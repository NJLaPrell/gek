import { createAction, props } from '@ngrx/store';
import { SubscriptionsResponse } from '../models/subscriptions';

export const getSubscriptions = createAction(
    '[Subscriptions] Get Subscriptions'
);

export const getSubscriptionsSuccess = createAction(
    '[Subscriptions] Get Subscriptions Success',
    props<{ response: SubscriptionsResponse }>()
);

export const getSubscriptionsFail = createAction(
    '[Subscriptions] Get Subscriptions Fail',
    props<{ error: string }>()
);

