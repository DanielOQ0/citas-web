import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';

const RETRIED = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const session = inject(SessionService);
  const publicEndpoint = /\/api\/auth\/(login|register|refresh|logout|password-recovery|password-reset)$/.test(request.url);
  const access = auth.accessToken();
  const authorized = access && !request.headers.has('Authorization')
    ? request.clone({ setHeaders: { Authorization: `Bearer ${access}` } })
    : request;
  return next(authorized).pipe(catchError(error => {
    if (error.status !== 401 || publicEndpoint || !access || authorized.context.get(RETRIED)) return throwError(() => error);
    return auth.refresh().pipe(
      switchMap(response => next(authorized.clone({
        setHeaders: { Authorization: `Bearer ${response.accessToken}` },
        context: authorized.context.set(RETRIED, true),
      }))),
      // Refresh vencido o revocado (HU-004 CA-02): la sesión termina y se vuelve al login.
      catchError(refreshError => { session.expire(); return throwError(() => refreshError); }),
    );
  }));
};
