import { createFeatureSelector, createSelector } from "@ngrx/store";
import { SubscriptionsState } from "../models/subscriptions";
import * as fromSubscriptions from '../reducers/subscriptions.reducer';


export const selectSubscriptionState = createFeatureSelector<SubscriptionsState>(
    fromSubscriptions.subscriptionsFeatureKey
);

export const selectSubscriptions = createSelector(
    selectSubscriptionState,
    (state) => state.subscriptions
);
