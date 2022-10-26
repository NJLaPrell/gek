import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Playlist } from "../state/models/playlist.model";
import { Observable, shareReplay } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class ListService {
    constructor(
        private http: HttpClient
    ) { }

    getLists = (): Observable<Playlist[]> =>this.http.get<Playlist[]>(`/api/getLists`).pipe(shareReplay());


}