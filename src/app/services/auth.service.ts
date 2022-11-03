import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { AuthState } from '../state/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
        private http: HttpClient
  ) { }

  get = (): Observable<AuthState> => this.http.get<AuthState>('/api/getAuthState').pipe(shareReplay());

}