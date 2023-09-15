import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ListService } from 'src/app/services/list.service';
import { ResourcesService } from 'src/app/services/resources.service';
import * as ListActions from '../actions/list.actions';
import * as VideoActions from '../actions/video.actions';
import { Playlist } from '../models/list.model';

@Injectable()
export class ListEffects {
  get$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ListActions.getLists),
      mergeMap(() =>
        this.listService.getLists().pipe(
          mergeMap((response: any) =>
            [ListActions.getListsSuccess({ items: response.items })].concat(response.items.map((i: Playlist) => VideoActions.getPlaylistVideos({ playlistId: i.playlistId || '', bypassCache: false })))
          ),
          catchError((error: HttpErrorResponse) => of(ListActions.getListsFail({ error: error.message })))
        )
      )
    )
  );

  getNocache$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ListActions.getUncachedLists),
      mergeMap(() =>
        this.listService.getLists(true).pipe(
          mergeMap((response: any) =>
            [ListActions.getListsSuccess({ items: response.items })].concat(response.items.map((i: Playlist) => VideoActions.getPlaylistVideos({ playlistId: i.playlistId || '', bypassCache: false })))
          ),
          catchError((error: HttpErrorResponse) => of(ListActions.getListsFail({ error: error.message })))
        )
      )
    )
  );

  getSubscriptions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ListActions.getSubscriptions),
      mergeMap(() =>
        this.resourcesService.getResource('subscriptions').pipe(
          map((response: any) => ListActions.getSubscriptionsSuccess({ response })),
          catchError((error: HttpErrorResponse) => of(ListActions.getSubscriptionsFail({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private listService: ListService,
    private resourcesService: ResourcesService
  ) {}
}
