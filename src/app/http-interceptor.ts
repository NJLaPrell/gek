import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class CustomInterceptor implements HttpInterceptor {

  constructor(
    private tokenExtractor: HttpXsrfTokenExtractor
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const cookieheaderName = 'X-XSRF-TOKEN';
    
    const csrfToken = <string>this.tokenExtractor.getToken();
    if (csrfToken !== null && ['POST','PUT','DELETE'].indexOf(req.method) !== -1) {
      req = req.clone({ 
        headers: req.headers.set(cookieheaderName, csrfToken).set('Content-Type', 'application/json'),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        body: { ...req.body, _csrf_token: csrfToken }
      });
    }

    return next.handle(req);
  }
}