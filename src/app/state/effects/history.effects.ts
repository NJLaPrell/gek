import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, of } from "rxjs";
import { HistoryService } from "src/app/services/history.service";
import * as HistoryActions from '../actions/history.actions';
import { HistoryState } from "../models/history.model";


@Injectable()
export class HistoryEffects {

    load$ = createEffect(() => this.actions$.pipe(
        ofType(HistoryActions.getHistory),
        mergeMap(() => this.historyService.get().pipe(
            map((response: HistoryState) => HistoryActions.getHistorySuccess({ response })),
            catchError((error: HttpErrorResponse) => of(HistoryActions.getHistoryFail({ error: error.message })))
        ))
    ));

    purgeUnsorted$ = createEffect(() => this.actions$.pipe(
        ofType(HistoryActions.purgeUnsorted),
        mergeMap(() => this.historyService.purgeUnsorted().pipe(
            map(() => HistoryActions.getHistory()),
            catchError((error: HttpErrorResponse) => of(HistoryActions.purgeUnsortedFail({ error: error.message })))
        ))
    ))

    constructor(
        private actions$: Actions,
        private historyService: HistoryService
    ) { }
}