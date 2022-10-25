import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import {  mergeMap, of, tap } from "rxjs";
import { RemoteService } from "src/app/services/remote.service";
import * as RemoteActions from '../actions/remote.actions';


@Injectable()
export class RemoteEffects {

    // Initialize the Remote service and socket connection.
    init$ = createEffect(() => this.actions$.pipe(
        ofType(RemoteActions.initializeSocketConnection),
        tap((action) => this.remoteService.initializeSocketConnection(action.clientType))
    ), { dispatch: false });

    // Send a handshake on connect. The service will repeat it until peerConnected() is called.
    connectionEstablished$ = createEffect(() => this.actions$.pipe(
        ofType(RemoteActions.connectionEstablished),
        tap(() => this.remoteService.sendHandshake())
    ), { dispatch: false });

    // When the peer sends a handshake, signal to the service not to repeat the handshake.
    receivedHandshake$ = createEffect(() => this.actions$.pipe(
        ofType(RemoteActions.receivedHandshake),
        tap(() => this.remoteService.peerConnected())
    ), { dispatch: false });

    // Send a command to the peer.
    sendCommand$ = createEffect(() => this.actions$.pipe(
        ofType(RemoteActions.sendCommand),
        tap((action) => this.remoteService.sendCommand(action))
    ), { dispatch: false });

    // Send a commandAck when a command is received.
    receivedCommandAck$ = createEffect(() => this.actions$.pipe(
        ofType(RemoteActions.receivedCommand),
        tap((action) => this.remoteService.sendCommandAck({ id: action.id, clientType: action.client }))
    ), { dispatch: false });

    // Disconnect from the socket server and resets the remote service.
    disconnect$ = createEffect(() => this.actions$.pipe(
        ofType(RemoteActions.disconnect),
        tap(() => this.remoteService.disconnect())
    ), { dispatch: false });

    // Disconnect from the socket server and reset the remote service when the peer disconnects.
    peerDisconnected$ = createEffect(() => this.actions$.pipe(
        ofType(RemoteActions.peerDisconnected),
        mergeMap(() => of(RemoteActions.disconnect()))
    ));


    constructor(
        private actions$: Actions,
        private remoteService: RemoteService
    ) { }
}