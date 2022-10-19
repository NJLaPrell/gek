import { Injectable } from "@angular/core";
import { Actions } from "@ngrx/effects";


@Injectable()
export class NavStateEffects {

    constructor(
        private actions$: Actions
    ) { }
}