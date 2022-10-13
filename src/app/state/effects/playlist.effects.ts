import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, of } from "rxjs";
import { ResourcesService } from "src/app/services/resources.service";
import * as PlaylistActions from '../actions/playlist.actions';
import { PlaylistResponse } from "../models/playlist.model";


@Injectable()
export class PlaylistsEffects {

    load$ = createEffect(() => this.actions$.pipe(
        ofType(PlaylistActions.getPlaylists),
        mergeMap(() => this.resourceService.getPlaylists().pipe(
            map((response: PlaylistResponse) => {
                console.log(response);
                return PlaylistActions.getPlaylistsSuccess({ response });
            }),
            catchError((error: HttpErrorResponse) => of(PlaylistActions.getPlaylistsFail({ error: error.message })))
        ))
    ));

    constructor(
        private actions$: Actions,
        private resourceService: ResourcesService
    ) { }
}