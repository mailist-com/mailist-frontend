import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

/**
 * API request options
 */
export interface ApiRequestOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
  observe?: 'body';
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

/**
 * Base API Service
 *
 * Provides common HTTP methods with built-in error handling,
 * token management, and request/response intercepting.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;
  private readonly defaultTimeout = environment.timeout;

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.get<T>(this.getUrl(endpoint), this.getOptions(options))
      .pipe(
        timeout(this.defaultTimeout),
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * GET request with pagination
   */
  getPaginated<T>(
    endpoint: string,
    page: number = 1,
    pageSize: number = environment.pagination.defaultPageSize,
    params?: Record<string, any>
  ): Observable<PaginatedResponse<T>> {
    const paginatedParams = {
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...params
    };

    return this.get<PaginatedResponse<T>>(endpoint, { params: paginatedParams });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    return this.http.post<T>(this.getUrl(endpoint), body, this.getOptions(options))
      .pipe(
        timeout(this.defaultTimeout),
        catchError(this.handleError)
      );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    return this.http.put<T>(this.getUrl(endpoint), body, this.getOptions(options))
      .pipe(
        timeout(this.defaultTimeout),
        catchError(this.handleError)
      );
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    return this.http.patch<T>(this.getUrl(endpoint), body, this.getOptions(options))
      .pipe(
        timeout(this.defaultTimeout),
        catchError(this.handleError)
      );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.delete<T>(this.getUrl(endpoint), this.getOptions(options))
      .pipe(
        timeout(this.defaultTimeout),
        catchError(this.handleError)
      );
  }

  /**
   * Upload file(s)
   */
  upload<T>(endpoint: string, formData: FormData, options?: ApiRequestOptions): Observable<T> {
    const uploadOptions = {
      ...this.getOptions(options),
      reportProgress: true,
    };

    return this.http.post<T>(this.getUrl(endpoint), formData, uploadOptions)
      .pipe(
        timeout(this.defaultTimeout * 2), // Double timeout for file uploads
        catchError(this.handleError)
      );
  }

  /**
   * Download file
   */
  download(endpoint: string, filename?: string): Observable<Blob> {
    return this.http.get(this.getUrl(endpoint), {
      responseType: 'blob',
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(this.defaultTimeout * 2),
      catchError(this.handleError)
    );
  }

  /**
   * Build full URL from endpoint
   */
  private getUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  /**
   * Get request options with default headers
   */
  private getOptions(options?: ApiRequestOptions): {
    headers: HttpHeaders;
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
    observe?: 'body';
    responseType?: 'json';
    withCredentials?: boolean;
  } {
    const opts: any = {
      headers: this.getAuthHeaders(options?.headers),
      observe: 'body' as const,
      responseType: 'json' as const
    };

    // Copy over other options if provided
    if (options?.params) opts.params = options.params;
    if (options?.withCredentials !== undefined) opts.withCredentials = options.withCredentials;

    return opts;
  }

  /**
   * Get headers with authentication token
   */
  private getAuthHeaders(additionalHeaders?: HttpHeaders | { [header: string]: string | string[] }): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });

    // Add authentication token if available
    const token = this.getAuthToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // Merge with additional headers
    if (additionalHeaders) {
      if (additionalHeaders instanceof HttpHeaders) {
        additionalHeaders.keys().forEach(key => {
          const value = additionalHeaders.get(key);
          if (value) {
            headers = headers.set(key, value);
          }
        });
      } else {
        Object.keys(additionalHeaders).forEach(key => {
          const value = additionalHeaders[key];
          if (value) {
            headers = headers.set(key, value as string);
          }
        });
      }
    }

    return headers;
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem(environment.storage.authToken) ||
           sessionStorage.getItem(environment.storage.authToken);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Backend error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Bad request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please login again.';
          // Optionally trigger logout
          this.handleUnauthorized();
          break;
        case 403:
          errorMessage = 'Access forbidden. You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = error.error?.message || 'Resource not found.';
          break;
        case 422:
          errorMessage = error.error?.message || 'Validation error. Please check your input.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || `Server error: ${error.status}`;
      }
    }

    console.error('API Error:', error);
    console.error('Error message:', errorMessage);

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      errors: error.error?.errors,
      originalError: error
    }));
  }

  /**
   * Handle unauthorized access (401)
   */
  private handleUnauthorized(): void {
    // Clear auth data
    localStorage.removeItem(environment.storage.authToken);
    localStorage.removeItem(environment.storage.refreshToken);
    localStorage.removeItem(environment.storage.currentUser);
    sessionStorage.removeItem(environment.storage.authToken);
    sessionStorage.removeItem(environment.storage.refreshToken);
    sessionStorage.removeItem(environment.storage.currentUser);

    // Redirect to login
    // Note: We can't inject Router here to avoid circular dependency
    // The AuthInterceptor will handle the redirect
    window.location.href = '/auth/login';
  }
}
