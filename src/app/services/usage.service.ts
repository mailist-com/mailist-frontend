import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { UsageStatistics, UsageHistory, UsageAlert } from '../models/usage.model';

@Injectable({
  providedIn: 'root',
})
export class UsageService {
  constructor() {}

  /**
   * Get current usage statistics
   */
  getUsageStatistics(): Observable<UsageStatistics> {
    return of(this.getMockUsageStatistics()).pipe(delay(400));
  }

  /**
   * Get usage history
   */
  getUsageHistory(days: number = 30): Observable<UsageHistory[]> {
    return of(this.getMockUsageHistory(days)).pipe(delay(400));
  }

  /**
   * Get usage alerts
   */
  getUsageAlerts(): Observable<UsageAlert[]> {
    return of(this.getMockUsageAlerts()).pipe(delay(300));
  }

  /**
   * Get mock usage statistics
   */
  private getMockUsageStatistics(): UsageStatistics {
    return {
      period: {
        start: new Date('2025-11-01'),
        end: new Date('2025-12-01'),
      },
      contacts: {
        current: 7234,
        limit: 10000,
        percentage: 72.34,
        trend: 5.2,
      },
      emails: {
        current: 45678,
        limit: 100000,
        percentage: 45.68,
        trend: -2.1,
      },
      users: {
        current: 3,
        limit: 5,
        percentage: 60,
        trend: 0,
      },
      automations: {
        current: 12,
        limit: -1, // unlimited
        percentage: 0,
        trend: 20,
      },
      templates: {
        current: 28,
        limit: -1, // unlimited
        percentage: 0,
        trend: 12.5,
      },
      apiCalls: {
        current: 2456,
        limit: 10000,
        percentage: 24.56,
        trend: 8.3,
      },
      storage: {
        current: 234,
        limit: 1000,
        percentage: 23.4,
        unit: 'MB',
        trend: 3.5,
      },
    };
  }

  /**
   * Get mock usage history
   */
  private getMockUsageHistory(days: number): UsageHistory[] {
    const history: UsageHistory[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      history.push({
        date,
        contacts: 7000 + Math.floor(Math.random() * 500),
        emailsSent: 1000 + Math.floor(Math.random() * 500),
        apiCalls: 50 + Math.floor(Math.random() * 100),
      });
    }

    return history;
  }

  /**
   * Get mock usage alerts
   */
  private getMockUsageAlerts(): UsageAlert[] {
    return [
      {
        id: 'alert_1',
        type: 'contacts',
        threshold: 80,
        current: 7234,
        limit: 10000,
        message: 'Wykorzystujesz 72% limitu kontaktów',
        severity: 'warning',
        createdAt: new Date('2025-11-04'),
      },
    ];
  }
}
