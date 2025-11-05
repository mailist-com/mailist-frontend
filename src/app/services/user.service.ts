import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, throwError } from 'rxjs';
import { User, UserProfile, NotificationSettings, UserPreferences } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<UserProfile>(this.getMockUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<UserProfile> {
    return of(this.currentUserSubject.value);
  }

  /**
   * Update user profile
   */
  updateProfile(updates: Partial<User>): Observable<UserProfile> {
    const currentUser = this.currentUserSubject.value;
    const updatedUser: UserProfile = {
      ...currentUser,
      ...updates,
    };

    this.currentUserSubject.next(updatedUser);
    return of(updatedUser);
  }

  /**
   * Update notification settings
   */
  updateNotificationSettings(settings: NotificationSettings): Observable<UserProfile> {
    const currentUser = this.currentUserSubject.value;
    const updatedUser: UserProfile = {
      ...currentUser,
      notifications: settings,
    };

    this.currentUserSubject.next(updatedUser);
    return of(updatedUser);
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): Observable<UserProfile> {
    const currentUser = this.currentUserSubject.value;
    const updatedUser: UserProfile = {
      ...currentUser,
      preferences: {
        ...currentUser.preferences,
        ...preferences,
      },
    };

    this.currentUserSubject.next(updatedUser);
    return of(updatedUser);
  }

  /**
   * Change password
   */
  changePassword(oldPassword: string, newPassword: string): Observable<boolean> {
    // Mock implementation
    if (oldPassword === 'wrong') {
      return throwError(() => new Error('Nieprawidłowe hasło'));
    }
    return of(true);
  }

  /**
   * Upload avatar
   */
  uploadAvatar(file: File): Observable<string> {
    // Mock implementation
    const mockUrl = `https://ui-avatars.com/api/?name=${this.currentUserSubject.value.firstName}+${this.currentUserSubject.value.lastName}`;

    const currentUser = this.currentUserSubject.value;
    const updatedUser: UserProfile = {
      ...currentUser,
      avatar: mockUrl,
    };

    this.currentUserSubject.next(updatedUser);
    return of(mockUrl);
  }

  /**
   * Get mock user data
   */
  private getMockUser(): UserProfile {
    return {
      id: 'user_1',
      email: 'jan.kowalski@example.com',
      firstName: 'Jan',
      lastName: 'Kowalski',
      avatar: 'https://ui-avatars.com/api/?name=Jan+Kowalski',
      role: 'owner',
      phone: '+48 123 456 789',
      company: 'Moja Firma Sp. z o.o.',
      timezone: 'Europe/Warsaw',
      language: 'pl',
      createdAt: new Date('2024-01-15'),
      lastLoginAt: new Date('2025-11-05T10:30:00'),
      notifications: {
        emailNotifications: true,
        campaignUpdates: true,
        automationAlerts: true,
        monthlyReports: true,
        systemUpdates: false,
      },
      preferences: {
        emailSignature: 'Pozdrawiam,\nJan Kowalski',
        defaultFromName: 'Jan Kowalski',
        defaultFromEmail: 'jan@mojaFirma.pl',
        dateFormat: 'DD.MM.YYYY',
        timeFormat: '24h',
      },
    };
  }
}
