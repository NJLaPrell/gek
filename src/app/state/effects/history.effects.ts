import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { HistoryService } from 'src/app/services/history.service';
import * as HistoryActions from '../actions/history.actions';
import { HistoryState } from '../models/history.model';

@Injectable()
export class HistoryEffects {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HistoryActions.getHistory),
      mergeMap(() =>
        this.historyService.get().pipe(
          map((response: HistoryState) => HistoryActions.getHistorySuccess({ response })),
          catchError((error: HttpErrorResponse) => of(HistoryActions.getHistoryFail({ error: error.message })))
        )
      )
    )
  );

  purgeUnsorted$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HistoryActions.purgeUnsorted),
      mergeMap(() =>
        this.historyService.purgeUnsorted().pipe(
          mergeMap(() => [HistoryActions.getHistory(), HistoryActions.purgeUnsortedSuccess({ message: 'Unsorted videoes have been purged.' })]),
          catchError((error: HttpErrorResponse) => of(HistoryActions.purgeUnsortedFail({ error: error.message })))
        )
      )
    )
  );

  deleteUnsortedItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HistoryActions.deleteUnsortedItem),
      mergeMap(action =>
        this.historyService.deleteUnsortedItem(action.id).pipe(
          map(() => HistoryActions.deleteUnsortedItemSuccess({ id: action.id, message: 'The unsorted item has been deleted.' })),
          catchError((error: HttpErrorResponse) => of(HistoryActions.deleteUnsortedItemFail({ error: error.message })))
        )
      )
    )
  );

  deleteErrorItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HistoryActions.deleteErrorItem),
      mergeMap(action =>
        this.historyService.deleteErrorItem(action.id).pipe(
          map(() => HistoryActions.deleteErrorItemSuccess({ id: action.id, message: 'The error item has been deleted.' })),
          catchError((error: HttpErrorResponse) => of(HistoryActions.deleteErrorItemFail({ error: error.message })))
        )
      )
    )
  );

  purgeErrors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(HistoryActions.purgeErrorBuffer),
      mergeMap(() =>
        this.historyService.purgeErrors().pipe(
          mergeMap(() => [HistoryActions.getHistory(), HistoryActions.purgeErrorBufferSuccess({ message: 'The error buffer has been purged.' })]),
          catchError((error: HttpErrorResponse) => of(HistoryActions.purgeErrorBufferFail({ error: error.message })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private historyService: HistoryService) {}
}
