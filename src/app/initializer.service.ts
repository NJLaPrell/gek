import { Injectable, Injector, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { concat, Observable, of, interval, merge, Subscription, switchMap } from 'rxjs';
import { AppState } from './state';
import { getAuthState } from './state/actions/auth.actions';
import { getHistory } from './state/actions/history.actions';
import { getSubscriptions, getUncachedLists } from './state/actions/list.actions';
import { getPreferences } from './state/actions/preferences.actions';
import { getRules } from './state/actions/rules.actions';
import { selectAuthenticated } from './state/selectors/auth.selectors';

@Injectable({
  providedIn: 'root'
})
export class InitializerService implements OnDestroy {
export class InitializerService {
  constructor(
        private injector: Injector,
        private store: Store<AppState>
  ) { 
    this.store.select(selectAuthenticated).subscribe(authenticated => this.initApp(authenticated));
  }

  private historyUpdateSubscription: Subscription;
  
  private initApp(authenticated: boolean) {
    if (authenticated) {
      this.historyUpdateSubscription = merge(
        this.getLists(),
        interval(60000).pipe(switchMap(() => this.getHistory())),
        this.getRules(),
        this.getSubscriptions(),
        this.getPreferences()
      ).subscribe();
    }
  }
  
  ngOnDestroy(): void {
    this.historyUpdateSubscription.unsubscribe();
  }

  private getLists(): Observable<any> {
    this.store.dispatch(getUncachedLists());
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
    return of([]);
  }
  private getAuthenticated(): Observable<any> {
    this.store.dispatch(getAuthState());
    return of([]);
  }
  private getPreferences(): Observable<any> {
    this.store.dispatch(getPreferences());
    return of([]);
  }

  init(): Promise<any> {
    return concat(
      this.getAuthenticated()
    ).toPromise();
  }
}