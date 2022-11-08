import { createReducer, on } from '@ngrx/store';
import * as RulesActions from '../actions/rules.actions';
import { initialRulesState } from '../models/rules.model';

export const rulesFeatureKey = 'rules';

export const rulesReducer = createReducer(
  initialRulesState,
  on(RulesActions.getRulesFail, state => ({ ...state })),
  on(RulesActions.getRulesSuccess, (state, action) => ({ rules: action.response.items })),
  on(RulesActions.addRuleSuccess, (state, action) => ({ rules: state.rules.concat(action.rule) })),
  on(RulesActions.updateRuleSuccess, (state, action) => {
    const rules = [...state.rules];
    const ix = rules.findIndex(r => r.id === action.rule.id);
    rules[ix] = action.rule;
    return { rules };
  }),
  on(RulesActions.deleteRuleSuccess, (state, action) => {
    const rules = [...state.rules];
    const ix = rules.findIndex(r => r.id === action.id);
    rules.splice(ix, 1);
    return { rules };
  })
);