import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { HistoryState } from "../state/models/history.model";
import { map, Observable, shareReplay } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    constructor(
        private http: HttpClient
    ) { }

    get = (): Observable<HistoryState> => this.http.get<HistoryState>(`/api/getResource/history`).pipe(shareReplay());

    purgeUnsorted = (): Observable<any> => this.http.post<any>(`/api/history/purgeUnsorted`, '').pipe();

}