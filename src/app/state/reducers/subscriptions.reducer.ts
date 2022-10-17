import { createReducer, on } from '@ngrx/store';
import * as SubscriptionsActions from '../actions/subscriptions.actions';
import { initialSubscriptionState, SubscriptionsHelper } from '../models/subscriptions';

export const subscriptionsFeatureKey = 'subscriptions';

export const subscriptionsReducer = createReducer(
    initialSubscriptionState,
    on(SubscriptionsActions.getSubscriptionsFail, state => ({ ...state })),
    on(SubscriptionsActions.getSubscriptionsSuccess, (state, action) => ({ ...(new SubscriptionsHelper(action.response).get()) }))
);