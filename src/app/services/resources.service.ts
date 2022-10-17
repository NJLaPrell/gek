import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PlaylistResponse } from "../state/models/playlist.model";
import { RulesResponse, Rule } from '../state/models/rules.model';
import { SubscriptionsResponse } from "../state/models/subscriptions";
import { Observable, shareReplay } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class ResourcesService {
    headers: HttpHeaders;

    constructor(
        private http: HttpClient
    ) {
        this.headers = new HttpHeaders().set("Content-Type", "application/json");
    }
    
    

    getPlaylists = (): Observable<PlaylistResponse> => this.getResource('playlists');

    getRules = (): Observable<RulesResponse> => this.getResource('rules');

    getSubscriptions = (): Observable<SubscriptionsResponse> => this.getResource('subscriptions');

    getResource = (resource: string): Observable<any> => this.http.get<any>(`/api/getResource/${resource}`).pipe(shareReplay());

    addRule = (rule: Rule): Observable<any> => {
        console.log(rule);
        return this.http.post<any>(`/api/resources/addRule`, { ...rule }, { headers: this.headers });
    }

    updateRule = (rule: Rule): Observable<any> => this.http.put<any>(`/api/resources/updateRule`, rule);

    deleteRule = (id: string): Observable<any> => this.http.delete<any>(`/api/resources/deleteRule/${id}`);

    

}