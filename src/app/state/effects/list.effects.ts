import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, of } from "rxjs";
import { ListService } from "src/app/services/list.service";
import { ResourcesService } from "src/app/services/resources.service";
import { GetListResponse } from "../models/list.model";
import * as ListActions from '../actions/list.actions';


@Injectable()
export class ListEffects {

    get$ = createEffect(() => this.actions$.pipe(
        ofType(ListActions.getLists),
        mergeMap(() => this.listService.getLists().pipe(
            map((response: any) => ListActions.getListsSuccess({ items: response.items })),
            catchError((error: HttpErrorResponse) => of(ListActions.getListsFail({ error: error.message })))
        ))
    ));

    getNocache$ = createEffect(() => this.actions$.pipe(
        ofType(ListActions.getUncachedLists),
        mergeMap(() => this.listService.getLists(true).pipe(
            map((response: any) => ListActions.getListsSuccess({ items: response.items })),
            catchError((error: HttpErrorResponse) => of(ListActions.getListsFail({ error: error.message })))
        ))
    ));

    getSubscriptions$ = createEffect(() => this.actions$.pipe(
        ofType(ListActions.getSubscriptions),
        mergeMap(() => this.resourcesService.getResource('subscriptions').pipe(
            map((response: any) => ListActions.getSubscriptionsSuccess({ response })),
            catchError((error: HttpErrorResponse) => of(ListActions.getSubscriptionsFail({ error: error.message })))
        ))
    ));

    constructor(
        private actions$: Actions,
        private listService: ListService,
        private resourcesService: ResourcesService
    ) { }
}