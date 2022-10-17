import { createAction, props } from '@ngrx/store';
import { Rule } from '../models/rules.model';

export const getRules = createAction(
  '[Rules] Get Rules'
);

export const getRulesSuccess = createAction(
    '[Rules] Get Rules Success',
    props<{ response: Rule[] }>()
  );

  export const getRulesFail = createAction(
    '[Rules] Get Rules Fail',
    props<{ error: string }>()
  );


