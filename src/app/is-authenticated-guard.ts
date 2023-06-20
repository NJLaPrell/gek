import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable, skipWhile, tap } from 'rxjs';
import { selectAuthenticated } from './state/selectors/auth.selectors';

@Injectable({
  providedIn: 'root',
})
export class IsAuthenticatedGuard implements CanActivate {
  private authenticated = false;

  constructor(private store: Store, private route: Router) {}

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.store.select(selectAuthenticated).pipe(
      skipWhile(auth => typeof auth != 'boolean'),
      map(auth => Boolean(auth)),
      tap(auth => {
        if (!auth) {
          this.route.navigateByUrl('/');
        }
      })
    );
  }
}
