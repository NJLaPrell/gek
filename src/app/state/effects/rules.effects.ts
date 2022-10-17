import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, of } from "rxjs";
import { ResourcesService } from 'src/app/services/resources.service';
import * as RulesActions from '../actions/rules.actions';
import { RulesResponse } from "../models/rules.model";


@Injectable()
export class RulesEffects {

    load$ = createEffect(() => this.actions$.pipe(
        ofType(RulesActions.getRules),
        mergeMap(() => this.resourceService.getRules().pipe(
            map((response: RulesResponse) => RulesActions.getRulesSuccess({ response: response.rules })),
            catchError((error: HttpErrorResponse) => of(RulesActions.getRulesFail({ error: error.message })))
        ))
    ));

    constructor(
        private actions$: Actions,
        private resourceService: ResourcesService
    ) { }
}