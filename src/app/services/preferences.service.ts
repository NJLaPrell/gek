import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Preferences } from '../state/models/preferences.model';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  headers: HttpHeaders;
  
  constructor(
        private http: HttpClient
  ) {
    this.headers = new HttpHeaders().set('Content-Type', 'application/json');
  }

  get = (): Observable<Preferences> => this.http.get<Preferences>('/api/preferences/getPreferences').pipe(shareReplay());

  set = (preferenceList: {[key: string]: any}[]): Observable<any> => this.http.post<any>('/api/preferences/setPreferences', { items: preferenceList }, { headers: this.headers });
  
}