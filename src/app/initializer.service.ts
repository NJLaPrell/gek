import { Injectable, Injector } from '@angular/core';
import { Store } from '@ngrx/store';
import { concat, Observable, of } from 'rxjs';
import { AppState } from './state';
import { getPlaylists } from './state/actions/playlist.actions';
import { getHistory } from './state/actions/history.actions';
import { getRules } from './state/actions/rules.actions';
import { getSubscriptions } from './state/actions/subscriptions.actions';


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
    private getRules(): Observable<any> {
        this.store.dispatch(getRules());
        return of([]);
    }

    private getSubscriptions(): Observable<any> {
        this.store.dispatch(getSubscriptions());
        return of([])
    }

    init(): Promise<any> {
        return concat(
            this.getPlaylists(),
            this.getHistory(),
            this.getRules(),
            this.getSubscriptions()
        ).toPromise()
    }
}