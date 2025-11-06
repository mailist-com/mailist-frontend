import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { map, tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ApiService, ApiResponse } from '../core/api/api.service';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  avatar?: string;
  plan?: 'free' | 'pro' | 'enterprise';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RegistrationResponse {
  message: string;
  requiresVerification?: boolean;
}

export interface VerificationResponse {
  user: User;
  token: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(
    private router: Router,
    private api: ApiService,
    private http: HttpClient
  ) {}

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  login(credentials: LoginCredentials): Observable<User> {
    this.isLoadingSubject.next(true);

    return this.api.post<ApiResponse<AuthResponse>>('auth/login', credentials)
      .pipe(
        map(response => {
          // Validate response structure
          if (!response) {
            throw new Error('No response received from server');
          }
          if (!response.success) {
            throw new Error(response.message || 'Login failed');
          }
          if (!response.data) {
            throw new Error('Invalid response format - missing data');
          }
          if (!response.data.user) {
            throw new Error('Invalid response format - missing user data');
          }
          if (!response.data.token) {
            throw new Error('Invalid response format - missing authentication token');
          }
          return response;
        }),
        map(response => {
          // Store tokens first
          const storage = credentials.rememberMe ? localStorage : sessionStorage;
          storage.setItem(environment.storage.authToken, response.data.token);
          if (response.data.refreshToken) {
            storage.setItem(environment.storage.refreshToken, response.data.refreshToken);
          }
          return response.data.user;
        }),
        tap(user => {
          this.setUser(user, credentials.rememberMe);
        }),
        tap(() => this.isLoadingSubject.next(false)),
        catchError(error => {
          this.isLoadingSubject.next(false);

          // Handle different error scenarios
          let errorMessage = 'An unexpected error occurred. Please try again.';

          if (error.status === 0) {
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else if (error.status === 401) {
            // Preserve backend message (e.g., "Please verify your email before logging in")
            // or use default message for invalid credentials
            errorMessage = error.message || 'Invalid email or password. Please try again.';
          } else if (error.status === 403) {
            // Email not verified
            errorMessage = error.message || 'Please verify your email address before logging in.';
          } else if (error.status === 422) {
            errorMessage = error.errors ? this.formatValidationErrors(error.errors) : 'Invalid input. Please check your credentials.';
          } else if (error.status === 429) {
            errorMessage = 'Too many login attempts. Please try again later.';
          } else if (error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.message) {
            errorMessage = error.message;
          }

          return throwError(() => errorMessage);
        })
      );
  }

  register(data: RegisterData): Observable<RegistrationResponse> {
    this.isLoadingSubject.next(true);

    return this.api.post<ApiResponse<RegistrationResponse>>('auth/register', data)
      .pipe(
        map(response => {
          // Validate response structure
          if (!response) {
            throw new Error('No response received from server');
          }
          if (!response.success) {
            throw new Error(response.message || 'Registration failed');
          }

          // Return the registration response (message about email verification)
          // Backend returns: { success: true, message: "...", timestamp: "..." }
          return {
            message: response.message || 'Registration successful. Please check your email.',
            requiresVerification: true
          };
        }),
        tap(() => this.isLoadingSubject.next(false)),
        catchError(error => {
          this.isLoadingSubject.next(false);

          // Handle different error scenarios
          let errorMessage = 'An unexpected error occurred. Please try again.';

          if (error.status === 0) {
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else if (error.status === 409) {
            errorMessage = 'An account with this email already exists.';
          } else if (error.status === 422) {
            errorMessage = error.errors ? this.formatValidationErrors(error.errors) : 'Invalid input. Please check your information.';
          } else if (error.status === 429) {
            errorMessage = 'Too many registration attempts. Please try again later.';
          } else if (error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.message) {
            errorMessage = error.message;
          }

          return throwError(() => errorMessage);
        })
      );
  }

  logout(): void {
    // Call API logout endpoint
    this.api.post('auth/logout', {}).subscribe();

    // Clear all auth data
    this.clearAuthData();

    // Navigate to login
    this.router.navigate(['/auth/login']);
  }

  resetPassword(email: string): Observable<string> {
    this.isLoadingSubject.next(true);

    return this.api.post<ApiResponse<{ message: string }>>('auth/password-reset', { email })
      .pipe(
        map(response => response.data.message || response.message || 'Password reset instructions sent'),
        tap(() => this.isLoadingSubject.next(false)),
        catchError(error => {
          this.isLoadingSubject.next(false);
          return throwError(() => error.message || 'Password reset failed');
        })
      );
  }

  updatePassword(token: string, password: string, confirmPassword: string): Observable<string> {
    this.isLoadingSubject.next(true);

    return this.api.post<ApiResponse<{ message: string }>>('auth/password-update', { token, password, confirmPassword })
      .pipe(
        map(response => response.data.message || response.message || 'Password updated successfully'),
        tap(() => this.isLoadingSubject.next(false)),
        catchError(error => {
          this.isLoadingSubject.next(false);
          return throwError(() => error.message || 'Password update failed');
        })
      );
  }

  verifyTwoFactor(code: string): Observable<User> {
    this.isLoadingSubject.next(true);

    return this.api.post<ApiResponse<AuthResponse>>('auth/verify-2fa', { code })
      .pipe(
        map(response => {
          // Validate response structure
          if (!response || !response.success || !response.data || !response.data.user) {
            throw new Error('Invalid response format');
          }
          // Store tokens if provided
          if (response.data.token) {
            localStorage.setItem(environment.storage.authToken, response.data.token);
          }
          if (response.data.refreshToken) {
            localStorage.setItem(environment.storage.refreshToken, response.data.refreshToken);
          }
          return response.data.user;
        }),
        tap(user => {
          this.setUser(user);
          this.isLoadingSubject.next(false);
        }),
        catchError(error => {
          this.isLoadingSubject.next(false);
          return throwError(() => error.message || 'Two-factor verification failed');
        })
      );
  }

  private setUser(user: User, rememberMe: boolean = false): void {
    this.currentUserSubject.next(user);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(environment.storage.currentUser, JSON.stringify(user));
  }

  /**
   * Format validation errors from backend into a user-friendly message
   */
  private formatValidationErrors(errors: Record<string, string[]>): string {
    const errorMessages: string[] = [];

    for (const [field, messages] of Object.entries(errors)) {
      if (messages && messages.length > 0) {
        // Capitalize first letter of field name
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
        errorMessages.push(`${fieldName}: ${messages[0]}`);
      }
    }

    return errorMessages.length > 0
      ? errorMessages.join('. ')
      : 'Validation failed. Please check your input.';
  }

  private getUserFromStorage(): User | null {
    try {
      const user = localStorage.getItem(environment.storage.currentUser) ||
                   sessionStorage.getItem(environment.storage.currentUser);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  /**
   * Refresh authentication token
   * Uses HttpClient directly to avoid interceptor recursion
   */
  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(environment.storage.refreshToken) ||
                        sessionStorage.getItem(environment.storage.refreshToken);

    if (!refreshToken) {
      return throwError(() => 'No refresh token available');
    }

    // Use HttpClient directly to bypass the auth interceptor
    // This prevents infinite loops when refresh token itself returns 401
    const url = `${environment.apiUrl}/auth/refresh-token`;

    return this.http.post<ApiResponse<{ token: string; refreshToken?: string }>>(
      url,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': environment.apiVersion
        }
      }
    ).pipe(
      map(response => {
        if (!response || !response.success || !response.data || !response.data.token) {
          throw new Error('Invalid refresh token response');
        }
        return response.data;
      }),
      tap(data => {
        // Determine which storage to use based on where refresh token was found
        const storage = localStorage.getItem(environment.storage.refreshToken) ? localStorage : sessionStorage;

        // Update access token
        storage.setItem(environment.storage.authToken, data.token);

        // Update refresh token if a new one was provided
        if (data.refreshToken) {
          storage.setItem(environment.storage.refreshToken, data.refreshToken);
        }
      }),
      map(data => data.token),
      catchError(error => {
        console.error('Token refresh failed:', error);
        // Clear tokens on refresh failure
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  /**
   * Clear all authentication data from storage
   */
  private clearAuthData(): void {
    localStorage.removeItem(environment.storage.authToken);
    localStorage.removeItem(environment.storage.refreshToken);
    localStorage.removeItem(environment.storage.currentUser);
    sessionStorage.removeItem(environment.storage.authToken);
    sessionStorage.removeItem(environment.storage.refreshToken);
    sessionStorage.removeItem(environment.storage.currentUser);
    this.currentUserSubject.next(null);
  }

  /**
   * Verify email with code
   */
  verifyEmail(email: string, code: string): Observable<string> {
    this.isLoadingSubject.next(true);

    return this.api.post<ApiResponse<any>>('auth/verify-email', { email, verificationCode: code })
      .pipe(
        map(response => {
          // Validate response structure
          if (!response || !response.success) {
            throw new Error('Email verification failed');
          }

          // Backend returns only success message, no user data or token
          // User needs to login after verification
          return response.message || 'Email verified successfully. You can now login.';
        }),
        tap(() => this.isLoadingSubject.next(false)),
        catchError(error => {
          this.isLoadingSubject.next(false);

          let errorMessage = 'Email verification failed. Please try again.';

          if (error.status === 0) {
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else if (error.status === 400) {
            errorMessage = 'Invalid or expired verification code.';
          } else if (error.status === 404) {
            errorMessage = 'User not found.';
          } else if (error.status === 422) {
            errorMessage = error.errors ? this.formatValidationErrors(error.errors) : 'Invalid input.';
          } else if (error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.message) {
            errorMessage = error.message;
          }

          return throwError(() => errorMessage);
        })
      );
  }

  /**
   * Resend verification code
   */
  resendVerificationCode(email: string): Observable<string> {
    this.isLoadingSubject.next(true);

    return this.api.post<ApiResponse<{ message: string }>>('auth/resend-verification', { email })
      .pipe(
        map(response => response.message || response.data?.message || 'Verification code sent'),
        tap(() => this.isLoadingSubject.next(false)),
        catchError(error => {
          this.isLoadingSubject.next(false);

          let errorMessage = 'Failed to resend verification code.';

          if (error.status === 0) {
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
          } else if (error.status === 404) {
            errorMessage = 'User not found.';
          } else if (error.status === 429) {
            errorMessage = 'Too many requests. Please try again later.';
          } else if (error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.message) {
            errorMessage = error.message;
          }

          return throwError(() => errorMessage);
        })
      );
  }
}