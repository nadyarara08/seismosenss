import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap, first } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding token for auth requests
    if (request.url.includes('/auth/')) {
      return next.handle(request);
    }

    return this.auth.user$.pipe(
      first(),
      switchMap(user => {
        if (user) {
          return from(firebase.auth().currentUser?.getIdToken() || Promise.resolve(null)).pipe(
            switchMap(token => {
              if (token) {
                const authReq = request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${token}`
                  }
                });
                return next.handle(authReq);
              }
              return next.handle(request);
            })
          );
        }
        return next.handle(request);
      })
    );
  }
}