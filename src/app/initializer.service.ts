import { Injectable, Injector } from '@angular/core';
import { Store } from '@ngrx/store';
import { concat, Observable, of, skipWhile } from 'rxjs';
import { AppState } from './state';
import { getHistory } from './state/actions/history.actions';
import { getPlaylists } from './state/actions/playlist.actions';
import { getRules } from './state/actions/rules.actions';
import { getSubscriptions } from './state/actions/subscriptions.actions';
import { getPlaylistVideos } from './state/actions/video.actions';
import { selectPlaylists } from './state/selectors/playlists.selectors';


@Injectable({
    providedIn: 'root'
})
export class InitializerService {
    constructor(
        private injector: Injector,
        private store: Store<AppState>
    ) {
        this.store.select(selectPlaylists).pipe(skipWhile(pl => pl.items.length === 0)).subscribe(pl => {
            pl.items.forEach(p => this.store.dispatch(getPlaylistVideos({ playlistId: p.id, useGApi: false })))
        })
    }

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