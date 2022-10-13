import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { PlaylistResponse } from "../state/models/playlist.model";
import { map, Observable, shareReplay } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class ResourcesService {
    constructor(
        private http: HttpClient
    ) { }

    getPlaylists(): Observable<PlaylistResponse> {
        return this.getResource('playlists');
    }

    getResource(resource: string): Observable<PlaylistResponse> {
        return this.http.get<PlaylistResponse>(`/api/getResource/${resource}`).pipe(shareReplay());
    }
}