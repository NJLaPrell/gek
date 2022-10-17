import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, of } from "rxjs";
import { ResourcesService } from "src/app/services/resources.service";
import * as SubscriptionActions from '../actions/subscriptions.actions';
import { SubscriptionsResponse } from "../models/subscriptions";


@Injectable()
export class SubscriptionsEffects {

    load$ = createEffect(() => this.actions$.pipe(
        ofType(SubscriptionActions.getSubscriptions),
        mergeMap(() => this.resourceService.getSubscriptions().pipe(
            map((response: SubscriptionsResponse) => SubscriptionActions.getSubscriptionsSuccess({ response })),
            catchError((error: HttpErrorResponse) => of(SubscriptionActions.getSubscriptionsFail({ error: error.message })))
        ))
    ));

    constructor(
        private actions$: Actions,
        private resourceService: ResourcesService
    ) { }
}