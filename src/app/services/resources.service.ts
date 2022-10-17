import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { PlaylistResponse } from "../state/models/playlist.model";
import { RulesResponse } from '../state/models/rules.model';
import { SubscriptionsResponse } from "../state/models/subscriptions";
import { Observable, shareReplay } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class ResourcesService {
    constructor(
        private http: HttpClient
    ) { }

    getPlaylists = (): Observable<PlaylistResponse> => this.getResource('playlists');

    getRules = (): Observable<RulesResponse> => this.getResource('rules');

    getSubscriptions = (): Observable<SubscriptionsResponse> => this.getResource('subscriptions');

    getResource = (resource: string): Observable<any> => this.http.get<any>(`/api/getResource/${resource}`).pipe(shareReplay());

    

}