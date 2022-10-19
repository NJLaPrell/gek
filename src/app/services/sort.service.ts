import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParamsOptions } from '@angular/common/http';
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SortService {
    headers: HttpHeaders;

    constructor(
        private http: HttpClient
    ) {
        this.headers = new HttpHeaders().set("Content-Type", "text/plain");
        
    }

    runSortService = () => this.http.post<string>('/api/runSort', { headers: this.headers, responseType: 'text' as 'json'});    

}