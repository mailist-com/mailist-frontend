import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { User, UserProfile, NotificationSettings, UserPreferences } from '../models/user.model';
import { ApiService } from '../core/api/api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<UserProfile> {
    return this.api.get<UserProfile>('profile').pipe(
      tap((user) => this.currentUserSubject.next(user)),
      catchError((error) => {
        console.error('Error fetching user profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(updates: Partial<User>): Observable<UserProfile> {
    return this.api.put<UserProfile>('profile', updates).pipe(
      tap((user) => this.currentUserSubject.next(user)),
      catchError((error) => {
        console.error('Error updating profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update notification settings
   */
  updateNotificationSettings(settings: NotificationSettings): Observable<UserProfile> {
    return this.api.put<UserProfile>('profile/notifications', settings).pipe(
      tap((user) => this.currentUserSubject.next(user)),
      catchError((error) => {
        console.error('Error updating notification settings:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): Observable<UserProfile> {
    return this.api.put<UserProfile>('profile/preferences', preferences).pipe(
      tap((user) => this.currentUserSubject.next(user)),
      catchError((error) => {
        console.error('Error updating preferences:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Change password
   */
  changePassword(oldPassword: string, newPassword: string): Observable<boolean> {
    return this.api.post<boolean>('profile/change-password', {
      oldPassword,
      newPassword,
    }).pipe(
      catchError((error) => {
        console.error('Error changing password:', error);
        return throwError(() => error);
      })
    );
  }

  // /**
  //  * Upload avatar
  //  */
  // uploadAvatar(file: File): Observable<string> {
  //   const formData = new FormData();
  //   formData.append('avatar', file);
  //
  //   return this.http.post<{ avatarUrl: string }>(`${this.apiUrl}/avatar`, formData).pipe(
  //     tap((response) => {
  //       const currentUser = this.currentUserSubject.value;
  //       if (currentUser) {
  //         this.currentUserSubject.next({ ...currentUser, avatar: response.avatarUrl });
  //       }
  //     }),
  //     catchError((error) => {
  //       console.error('Error uploading avatar:', error);
  //       return throwError(() => error);
  //     })
  //   ).pipe(
  //     tap((response) => response.avatarUrl)
  //   ) as Observable<string>;
  // }
}
