import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SortService {
    headers: HttpHeaders;

    constructor(
        private http: HttpClient
    ) {
        this.headers = new HttpHeaders().set("Content-Type", "application/json");
    }

    runSortService = (): Observable<any> => this.http.post<any>(`/api/runSort`, {});    

}