import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ResourcesService } from 'src/app/services/resources.service';
import * as RulesActions from '../actions/rules.actions';
import { RulesResponse } from '../models/rules.model';

@Injectable()
export class RulesEffects {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RulesActions.getRules),
      mergeMap(() =>
        this.resourceService.getRules().pipe(
          map((response: RulesResponse) => RulesActions.getRulesSuccess({ response: response })),
          catchError((error: HttpErrorResponse) => of(RulesActions.getRulesFail({ error: error.message })))
        )
      )
    )
  );

  addRule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RulesActions.addRule),
      mergeMap(action =>
        this.resourceService.addRule({ ...action.rule }).pipe(
          map(() => RulesActions.addRuleSuccess({ rule: action.rule, message: 'Rule added.' })),
          catchError((error: HttpErrorResponse) => of(RulesActions.addRuleFail({ error: error.message })))
        )
      )
    )
  );

  updateRule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RulesActions.updateRule),
      mergeMap(action =>
        this.resourceService.updateRule({ ...action.rule }).pipe(
          map(() => RulesActions.updateRuleSuccess({ rule: action.rule, message: 'Rule updated.' })),
          catchError((error: HttpErrorResponse) => of(RulesActions.updateRuleFail({ error: error.message })))
        )
      )
    )
  );

  deleteRule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RulesActions.deleteRule),
      mergeMap(action =>
        this.resourceService.deleteRule(action.id).pipe(
          map(() => RulesActions.deleteRuleSuccess({ id: action.id, message: 'Rule deleted.' })),
          catchError((error: HttpErrorResponse) => of(RulesActions.deleteRuleFail({ error: error.message })))
        )
      )
    )
  );

  orderRule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RulesActions.orderRule),
      mergeMap(action =>
        this.resourceService.orderRule(action.id, action.index).pipe(
          map(() => RulesActions.orderRuleSuccess({ id: action.id, index: action.index })),
          catchError((error: HttpErrorResponse) => of(RulesActions.orderRuleFail({ error: error.message })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private resourceService: ResourcesService) {}
}
