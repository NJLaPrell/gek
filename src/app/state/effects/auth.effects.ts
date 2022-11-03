import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import * as AuthActions from '../actions/auth.actions';
import { AuthState } from '../models/auth.model';


@Injectable()
export class AuthEffects {

  getAuthState$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.getAuthState),
    mergeMap(() => this.authService.get().pipe(
      map((response: AuthState) => AuthActions.getAuthStateSuccess({ authState: response })),
      catchError((error: HttpErrorResponse) => of(AuthActions.getAuthStateFail({ error: error.message })))
    ))
  ));

  constructor(
        private actions$: Actions,
        private authService: AuthService
  ) { }
}