import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { map, tap, catchError } from 'rxjs/operators';
import { ApiService, ApiResponse } from '../core/api/api.service';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  avatar?: string;
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
    private api: ApiService
  ) {}

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  login(credentials: LoginCredentials): Observable<User> {
    this.isLoadingSubject.next(true);

    // Use real API if mock data is disabled
    if (!environment.features.enableMockData) {
      return this.api.post<ApiResponse<AuthResponse>>('auth/login', credentials)
        .pipe(
          map(response => response.data.user),
          tap(user => {
            this.setUser(user, credentials.rememberMe);
            this.setTokens(user, credentials.rememberMe);
          }),
          tap(() => this.isLoadingSubject.next(false)),
          catchError(error => {
            this.isLoadingSubject.next(false);
            return throwError(() => error.message || 'Login failed');
          })
        );
    }

    // Fallback to mock data for development
    return new Observable(observer => {
      setTimeout(() => {
        // Mock validation
        if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
          const user: User = {
            id: '1',
            email: credentials.email,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff'
          };

          this.setUser(user, credentials.rememberMe);
          this.isLoadingSubject.next(false);
          observer.next(user);
          observer.complete();
        } else if (credentials.email === 'user@example.com' && credentials.password === 'password') {
          const user: User = {
            id: '2',
            email: credentials.email,
            firstName: 'John',
            lastName: 'Doe',
            role: 'user',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=059669&color=fff'
          };

          this.setUser(user, credentials.rememberMe);
          this.isLoadingSubject.next(false);
          observer.next(user);
          observer.complete();
        } else {
          this.isLoadingSubject.next(false);
          observer.error('Invalid email or password');
        }
      }, 1500); // Simulate network delay
    });
  }

  register(data: RegisterData): Observable<User> {
    this.isLoadingSubject.next(true);

    // Use real API if mock data is disabled
    if (!environment.features.enableMockData) {
      return this.api.post<ApiResponse<AuthResponse>>('auth/register', data)
        .pipe(
          map(response => response.data.user),
          tap(user => {
            this.setUser(user);
            this.setTokens(user);
          }),
          tap(() => this.isLoadingSubject.next(false)),
          catchError(error => {
            this.isLoadingSubject.next(false);
            return throwError(() => error.message || 'Registration failed');
          })
        );
    }

    // Fallback to mock data for development
    return new Observable(observer => {
      setTimeout(() => {
        // Mock validation
        if (data.password !== data.confirmPassword) {
          this.isLoadingSubject.next(false);
          observer.error('Passwords do not match');
          return;
        }

        if (data.email === 'admin@example.com' || data.email === 'user@example.com') {
          this.isLoadingSubject.next(false);
          observer.error('User with this email already exists');
          return;
        }

        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'user',
          avatar: `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=059669&color=fff`
        };

        this.setUser(user);
        this.isLoadingSubject.next(false);
        observer.next(user);
        observer.complete();
      }, 1500);
    });
  }

  logout(): void {
    // Call API logout endpoint if not using mock data
    if (!environment.features.enableMockData) {
      this.api.post('auth/logout', {}).subscribe();
    }

    // Clear all auth data
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem(environment.storage.authToken);
    localStorage.removeItem(environment.storage.refreshToken);
    sessionStorage.removeItem(environment.storage.authToken);
    sessionStorage.removeItem(environment.storage.refreshToken);

    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  resetPassword(email: string): Observable<string> {
    this.isLoadingSubject.next(true);

    // Use real API if mock data is disabled
    if (!environment.features.enableMockData) {
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

    // Fallback to mock data
    return new Observable(observer => {
      setTimeout(() => {
        // Mock validation
        if (email === 'admin@example.com' || email === 'user@example.com') {
          this.isLoadingSubject.next(false);
          observer.next('Password reset instructions have been sent to your email');
          observer.complete();
        } else {
          this.isLoadingSubject.next(false);
          observer.error('User with this email does not exist');
        }
      }, 1500);
    });
  }

  updatePassword(token: string, password: string, confirmPassword: string): Observable<string> {
    this.isLoadingSubject.next(true);

    return new Observable(observer => {
      setTimeout(() => {
        if (password !== confirmPassword) {
          this.isLoadingSubject.next(false);
          observer.error('Passwords do not match');
          return;
        }

        if (password.length < 6) {
          this.isLoadingSubject.next(false);
          observer.error('Password must be at least 6 characters long');
          return;
        }

        this.isLoadingSubject.next(false);
        observer.next('Password updated successfully');
        observer.complete();
      }, 1500);
    });
  }

  verifyTwoFactor(code: string): Observable<User> {
    this.isLoadingSubject.next(true);

    return new Observable(observer => {
      setTimeout(() => {
        if (code === '123456') {
          const user = this.currentUserValue;
          if (user) {
            this.isLoadingSubject.next(false);
            observer.next(user);
            observer.complete();
          } else {
            this.isLoadingSubject.next(false);
            observer.error('Session expired. Please login again.');
          }
        } else {
          this.isLoadingSubject.next(false);
          observer.error('Invalid verification code');
        }
      }, 1500);
    });
  }

  private setUser(user: User, rememberMe: boolean = false): void {
    this.currentUserSubject.next(user);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(environment.storage.currentUser, JSON.stringify(user));
  }

  private setTokens(user: any, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;

    // Store tokens if they exist in the response
    if (user.token) {
      storage.setItem(environment.storage.authToken, user.token);
    }
    if (user.refreshToken) {
      storage.setItem(environment.storage.refreshToken, user.refreshToken);
    }
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
   */
  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(environment.storage.refreshToken) ||
                        sessionStorage.getItem(environment.storage.refreshToken);

    if (!refreshToken) {
      return throwError(() => 'No refresh token available');
    }

    return this.api.post<ApiResponse<{ token: string }>>('auth/refresh-token', { refreshToken })
      .pipe(
        map(response => response.data.token),
        tap(token => {
          const storage = localStorage.getItem(environment.storage.refreshToken) ? localStorage : sessionStorage;
          storage.setItem(environment.storage.authToken, token);
        })
      );
  }

  // Demo users info for testing
  getDemoUsers(): { email: string; password: string; role: string }[] {
    return [
      { email: 'admin@example.com', password: 'password', role: 'Admin' },
      { email: 'user@example.com', password: 'password', role: 'User' }
    ];
  }
}