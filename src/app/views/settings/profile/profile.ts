import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { UserService } from '../../../services/user.service';
import { UserProfile } from '../../../models/user.model';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-profile-settings',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileSettings implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  user: UserProfile | null = null;
  saving = false;

  // Form data
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    timezone: '',
    language: '',
  };

  notifications = {
    emailNotifications: false,
    campaignUpdates: false,
    automationAlerts: false,
    monthlyReports: false,
    systemUpdates: false,
  };

  preferences = {
    defaultFromName: '',
    defaultFromEmail: '',
    emailSignature: '',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h' as '12h' | '24h',
  };

  constructor(
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUser() {
    this.userService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          console.log('User profile loaded:', user);
          this.user = user;
          this.formData = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '',
            company: user.company || '',
            timezone: user.timezone,
            language: user.language,
          };
          this.notifications = { ...user.notifications };
          this.preferences = {
            defaultFromName: user.preferences.defaultFromName || '',
            defaultFromEmail: user.preferences.defaultFromEmail || '',
            emailSignature: user.preferences.emailSignature || '',
            dateFormat: user.preferences.dateFormat,
            timeFormat: user.preferences.timeFormat,
          };
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.toastService.error('Błąd podczas ładowania profilu użytkownika');
        }
      });
  }

  saveProfile() {
    this.saving = true;
    this.userService
      .updateProfile(this.formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.toastService.success('Profil zaktualizowany pomyślnie');
        },
        error: () => {
          this.saving = false;
          this.toastService.error('Błąd podczas aktualizacji profilu');
        },
      });
  }

  saveNotifications() {
    this.saving = true;
    this.userService
      .updateNotificationSettings(this.notifications)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.toastService.success('Powiadomienia zaktualizowane');
        },
        error: () => {
          this.saving = false;
          this.toastService.error('Błąd podczas aktualizacji powiadomień');
        },
      });
  }

  savePreferences() {
    this.saving = true;
    this.userService
      .updatePreferences(this.preferences)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.toastService.success('Preferencje zaktualizowane');
        },
        error: () => {
          this.saving = false;
          this.toastService.error('Błąd podczas aktualizacji preferencji');
        },
      });
  }
}
