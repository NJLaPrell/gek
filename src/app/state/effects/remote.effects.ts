import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs';
import { RemoteService } from 'src/app/services/remote.service';
import * as RemoteActions from '../actions/remote.actions';

@Injectable()
export class RemoteEffects {
  // Initialize the Remote service and socket connection.
  init$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RemoteActions.initializeSocketConnection),
        tap(action => this.remoteService.initializeSocketConnection(action.clientType, action.userId))
      ),
    { dispatch: false }
  );

  // Send a command to the peer.
  sendCommand$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RemoteActions.sendCommand),
        tap(action => this.remoteService.sendCommand(action))
      ),
    { dispatch: false }
  );

  // Disconnect from the socket server and resets the remote service.
  disconnect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RemoteActions.disconnect),
        tap(() => this.remoteService.disconnect())
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private remoteService: RemoteService
  ) {}
}
