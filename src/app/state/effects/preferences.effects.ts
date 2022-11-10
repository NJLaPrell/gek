import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { PreferencesService } from 'src/app/services/preferences.service';
import * as PreferencesActions from '../actions/preferences.actions';
import { Preferences } from '../models/preferences.model';


@Injectable()
export class PreferencesEffects {

  constructor(
    private actions$: Actions,
    private prefService: PreferencesService
  ) { }

  getPreferences$ = createEffect(() => this.actions$.pipe(
    ofType(PreferencesActions.getPreferences),
    mergeMap(() => this.prefService.get().pipe(
      map((preferences: Preferences) => PreferencesActions.getPreferencesSuccess({ preferences })),
      catchError((error: HttpErrorResponse) => of(PreferencesActions.getPreferencesFail({ error: error.message })))
    ))
  ));

  setPreferences$ = createEffect(() => this.actions$.pipe(
    ofType(PreferencesActions.setPreferences),
    mergeMap((action: Preferences) => this.prefService.set(action.items).pipe(
      map(() => PreferencesActions.setPreferencesSuccess({ message: 'Preferences saved.', preferences: action })),
      catchError((error: HttpErrorResponse) => of(PreferencesActions.setPreferencesFail({ error: error.message })))
    ))
  ));

}