import { Injectable, Injector } from '@angular/core';
import { Store } from '@ngrx/store';
import { concat, Observable, of, skipWhile } from 'rxjs';
import { AppState } from './state';
import { getHistory } from './state/actions/history.actions';
import { getLists } from './state/actions/list.actions';
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

    private getLists(): Observable<any> {
        this.store.dispatch(getLists());
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
            this.getLists(),
            this.getHistory(),
            this.getRules(),
            this.getSubscriptions()
        ).toPromise()
    }
}