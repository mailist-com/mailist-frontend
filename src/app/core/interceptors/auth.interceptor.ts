import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, BehaviorSubject, Observable, filter, take, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

// Track if token refresh is in progress
let isRefreshing = false;
// Queue for requests waiting for token refresh
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * HTTP Interceptor for adding authentication token to requests
 * and handling authentication errors with automatic token refresh
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

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
        // Check if this is an auth endpoint (login, register, verify-email, refresh-token)
        const isAuthEndpoint = req.url.includes('/auth/login') ||
                              req.url.includes('/auth/register') ||
                              req.url.includes('/auth/verify-email') ||
                              req.url.includes('/auth/refresh-token');

        // For auth endpoints, don't try to refresh token - just pass the error through
        if (isAuthEndpoint) {
          return throwError(() => error);
        }

        // For other endpoints, try to refresh the token
        return handle401Error(req, next, router, authService);
      }

      return throwError(() => error);
    })
  );
};

/**
 * Handle 401 error by attempting to refresh the token
 */
function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  router: Router,
  authService: AuthService
): Observable<any> {
  // If token refresh is not already in progress
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    // Get refresh token
    const refreshToken = localStorage.getItem(environment.storage.refreshToken) ||
                        sessionStorage.getItem(environment.storage.refreshToken);

    // If no refresh token, logout immediately
    if (!refreshToken) {
      isRefreshing = false;
      handleLogout(router);
      return throwError(() => new Error('No refresh token available'));
    }

    // Call refresh token endpoint
    return authService.refreshToken().pipe(
      switchMap((newToken: string) => {
        isRefreshing = false;
        // Emit new token to all waiting requests
        refreshTokenSubject.next(newToken);

        // Retry the original request with new token
        return next(addTokenToRequest(request, newToken));
      }),
      catchError((error) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);

        // Refresh failed - logout user
        handleLogout(router);
        return throwError(() => error);
      })
    );
  } else {
    // Token refresh is in progress - queue this request
    return refreshTokenSubject.pipe(
      filter(token => token !== null), // Wait for new token
      take(1), // Take only the first emitted value
      switchMap(token => {
        // Retry request with new token
        return next(addTokenToRequest(request, token!));
      })
    );
  }
}

/**
 * Add token to request headers
 */
function addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`)
  });
}

/**
 * Handle logout - clear storage and redirect to login
 */
function handleLogout(router: Router): void {
  // Clear all auth data
  localStorage.removeItem(environment.storage.authToken);
  localStorage.removeItem(environment.storage.refreshToken);
  localStorage.removeItem(environment.storage.currentUser);
  sessionStorage.removeItem(environment.storage.authToken);
  sessionStorage.removeItem(environment.storage.refreshToken);
  sessionStorage.removeItem(environment.storage.currentUser);

  // Redirect to login
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: router.url, sessionExpired: 'true' }
  });
}
