/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpXsrfTokenExtractor } from '@angular/common/http';
import { fromFetch } from 'rxjs/fetch';

@Injectable({
  providedIn: 'root'
})
export class SortService {

  constructor(
        private tokenExtractor: HttpXsrfTokenExtractor,
  ) { }

  runSortService = () => {
    const token = <string>this.tokenExtractor.getToken();
    return fromFetch('/api/runSort', {
      method: 'POST',
      body: JSON.stringify({ _csrf_token: token }),
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': token
      },
    });
  };

}