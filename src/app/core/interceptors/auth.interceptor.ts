import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * HTTP Interceptor for adding authentication token to requests
 * and handling authentication errors
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Get token from storage
  const token = localStorage.getItem(environment.storage.authToken) ||
                sessionStorage.getItem(environment.storage.authToken);

  // Clone request and add authorization header if token exists
  let authReq = req;
  if (token && !req.headers.has('Authorization')) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  // Add API version header
  authReq = authReq.clone({
    headers: authReq.headers.set('X-API-Version', environment.apiVersion)
  });

  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        // Check if this is an auth endpoint (login, register, verify-email)
        const isAuthEndpoint = req.url.includes('/auth/login') ||
                              req.url.includes('/auth/register') ||
                              req.url.includes('/auth/verify-email');

        if (!isAuthEndpoint) {
          // Only clear auth data and redirect for non-auth endpoints
          // Auth endpoints will handle their own error messages and redirects
          localStorage.removeItem(environment.storage.authToken);
          localStorage.removeItem(environment.storage.refreshToken);
          localStorage.removeItem(environment.storage.currentUser);
          sessionStorage.removeItem(environment.storage.authToken);
          sessionStorage.removeItem(environment.storage.refreshToken);
          sessionStorage.removeItem(environment.storage.currentUser);

          // Redirect to login
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url }
          });
        }
      }

      return throwError(() => error);
    })
  );
};
