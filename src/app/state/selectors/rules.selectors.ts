import { createFeatureSelector, createSelector } from "@ngrx/store";
import { RulesState } from "../models/rules.model";
import * as fromRules from '../reducers/rules.reducer';


export const selectRulesState = createFeatureSelector<RulesState>(
    fromRules.rulesFeatureKey
);

export const selectRules = createSelector(
    selectRulesState,
    (state) => state.rules
);
