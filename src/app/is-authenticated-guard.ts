import { Injectable } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAuthenticated } from './state/selectors/auth.selectors';


@Injectable({
  providedIn: 'root'
})
export class IsAuthenticatedGuard implements CanActivate {
  private authenticated = false;

  constructor(
    private store: Store
  ) {
    this.store.select(selectAuthenticated).subscribe(auth => this.authenticated = auth);
  }

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.authenticated;
  }
}