import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParamsOptions } from '@angular/common/http';
import { Observable } from "rxjs";
import { fromFetch } from 'rxjs/fetch'

@Injectable({
    providedIn: 'root'
})
export class SortService {
    headers: HttpHeaders;

    constructor(
        private http: HttpClient
    ) {
        this.headers = new HttpHeaders().set("Content-Type", "text/plain").set("Accept", "text/plain");
        
    }

    //runSortService = (): Observable<ArrayBuffer> => this.http.request<ArrayBuffer>('POST', '/api/runSort', { headers: this.headers });    

    runSortService = () => fromFetch('/api/runSort', {
        method: 'POST',
        body: '',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'text/plain',
          },
      });

}