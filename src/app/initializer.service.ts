import { Injectable, Injector } from '@angular/core';
import { Store } from '@ngrx/store';
import { concat, Observable, of } from 'rxjs';
import { AppState } from './state';
import { getPlaylists } from './state/actions/playlist.actions';
import { getHistory } from './state/actions/history.actions';


@Injectable({
    providedIn: 'root'
})
export class InitializerService {
    constructor(
        private injector: Injector,
        private store: Store<AppState>
    ) { }

    private getPlaylists(): Observable<any> {
        this.store.dispatch(getPlaylists())
        return of([]);
    }

    private getHistory(): Observable<any> {
        this.store.dispatch(getHistory());
        return of([]);
    }

    init(): Promise<any> {
        return concat(
            this.getPlaylists(),
            this.getHistory()
        ).toPromise()
    }
}