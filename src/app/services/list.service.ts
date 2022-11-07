import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Playlist } from '../state/models/list.model';
import { Observable, shareReplay } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ListService {
  constructor(
        private http: HttpClient
  ) { }

  getLists = (nocache = false): Observable<Playlist[]> =>this.http.get<Playlist[]>(`/api/getLists?nocache=${nocache}`).pipe(shareReplay());


}