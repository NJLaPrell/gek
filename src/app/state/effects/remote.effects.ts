import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import {  tap } from "rxjs";
import { RemoteService } from "src/app/services/remote.service";
import * as RemoteActions from '../actions/remote.actions';


@Injectable()
export class RemoteEffects {

    init$ = createEffect(() => this.actions$.pipe(
        ofType(RemoteActions.initializeSocketConnection),
        tap((action) => this.remoteService.initializeSocketConnection(action.clientType))
    ), { dispatch: false });

    connectionEstablished$ = createEffect(() => this.actions$.pipe(
        ofType(RemoteActions.connectionEstablished),
        tap(() => this.remoteService.sendHandshake())
    ), { dispatch: false });

    sendCommand$ = createEffect(() => this.actions$.pipe(
        ofType(RemoteActions.sendCommand),
        tap((action) => this.remoteService.sendCommand(action.command))
    ), { dispatch: false });

    receivedCommandAck$ = createEffect(() => this.actions$.pipe(
        ofType(RemoteActions.receivedCommand),
        tap((action) => this.remoteService.sendCommandAck({ id: action.command.id }))
    ), { dispatch: false });

    disconnect$ = createEffect(() => this.actions$.pipe(
        ofType(RemoteActions.disconnect),
        tap(() => this.remoteService.disconnect())
    ), { dispatch: false });

    peerDisconnected$ = createEffect(() => this.actions$.pipe(
        ofType(RemoteActions.peerDisconnected),
        tap((action) => this.remoteService.disconnect())
    ), { dispatch: false });


    constructor(
        private actions$: Actions,
        private remoteService: RemoteService
    ) { }
}