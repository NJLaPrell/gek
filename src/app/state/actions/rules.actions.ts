import { createAction, props } from '@ngrx/store';
import { Rule } from '../models/rules.model';

export const getRules = createAction('[Rules] Get Rules');

export const getRulesSuccess = createAction('[Rules] Get Rules Success', props<{ response: { lastUpdated: number; items: Rule[] } }>());

export const getRulesFail = createAction('[Rules] Get Rules Fail', props<{ error: string }>());

export const addRule = createAction('[Rules] Add Rule', props<{ rule: Rule }>());

export const addRuleSuccess = createAction('[Rules] Add Rule Success', props<{ rule: Rule; message: string }>());

export const addRuleFail = createAction('[Rules] Add Rule Fail', props<{ error: string }>());

export const updateRule = createAction('[Rules] Update Rule', props<{ rule: Rule }>());

export const updateRuleSuccess = createAction('[Rules] Update Rule Success', props<{ rule: Rule; message: string }>());

export const updateRuleFail = createAction('[Rules] Update Rule Fail', props<{ error: string }>());

export const deleteRule = createAction('[Rules] Delete Rule', props<{ id: string }>());

export const deleteRuleSuccess = createAction('[Rules] Delete Rule Success', props<{ id: string; message: string }>());

export const deleteRuleFail = createAction('[Rules] Delete Rule Fail', props<{ error: string }>());

export const orderRule = createAction('[Rules] Order Rule', props<{ id: string; index: number }>());

export const orderRuleSuccess = createAction('[Rules] Order Rule Success', props<{ id: string; index: number }>());

export const orderRuleFail = createAction('[Rules] Order Rule Fail', props<{ error: string }>());
