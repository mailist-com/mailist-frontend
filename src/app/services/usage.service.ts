import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { UsageStatistics, UsageHistory, UsageAlert } from '../models/usage.model';
import { ApiService } from '../core/api/api.service';

interface UsageStatisticsResponse {
  period: {
    start: string;
    end: string;
  };
  contacts: {
    current: number;
    limit: number;
    percentage: number;
    trend?: number;
  };
  emails: {
    current: number;
    limit: number;
    percentage: number;
    trend?: number;
  };
  users: {
    current: number;
    limit: number;
    percentage: number;
    trend?: number;
  };
  automations: {
    current: number;
    limit: number;
    percentage: number;
    trend?: number;
  };
  templates: {
    current: number;
    limit: number;
    percentage: number;
    trend?: number;
  };
  apiCalls: {
    current: number;
    limit: number;
    percentage: number;
    trend?: number;
  };
  storage: {
    current: number;
    limit: number;
    percentage: number;
    unit: string;
    trend?: number;
  };
}

interface UsageAlertsResponse {
  alerts: {
    id: string;
    type: string;
    threshold: number;
    current: number;
    limit: number;
    message: string;
    severity: string;
    createdAt: string;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class UsageService {
  private apiService = inject(ApiService);

  /**
   * Get current usage statistics from API
   */
  getUsageStatistics(): Observable<UsageStatistics> {
    return this.apiService.get<UsageStatisticsResponse>('dashboard/usage-statistics').pipe(
      map((response) => this.mapToUsageStatistics(response))
    );
  }

  /**
   * Get usage history
   */
  getUsageHistory(days: number = 30): Observable<UsageHistory[]> {
    // This can be implemented later when backend supports it
    // For now, return empty array or mock data
    return this.apiService.get<UsageHistory[]>('dashboard/usage-history', {
      params: { days },
    });
  }

  /**
   * Get usage alerts from API
   */
  getUsageAlerts(): Observable<UsageAlert[]> {
    return this.apiService.get<UsageAlertsResponse>('dashboard/usage-alerts').pipe(
      map((response) => this.mapToUsageAlerts(response))
    );
  }

  /**
   * Map API response to UsageStatistics model
   */
  private mapToUsageStatistics(response: UsageStatisticsResponse): UsageStatistics {
    return {
      period: {
        start: new Date(response.period.start),
        end: new Date(response.period.end),
      },
      contacts: {
        current: response.contacts.current,
        limit: response.contacts.limit,
        percentage: response.contacts.percentage,
        trend: response.contacts.trend,
      },
      emails: {
        current: response.emails.current,
        limit: response.emails.limit,
        percentage: response.emails.percentage,
        trend: response.emails.trend,
      },
      users: {
        current: response.users.current,
        limit: response.users.limit,
        percentage: response.users.percentage,
        trend: response.users.trend,
      },
      automations: {
        current: response.automations.current,
        limit: response.automations.limit,
        percentage: response.automations.percentage,
        trend: response.automations.trend,
      },
      templates: {
        current: response.templates.current,
        limit: response.templates.limit,
        percentage: response.templates.percentage,
        trend: response.templates.trend,
      },
      apiCalls: {
        current: response.apiCalls.current,
        limit: response.apiCalls.limit,
        percentage: response.apiCalls.percentage,
        trend: response.apiCalls.trend,
      },
      storage: {
        current: response.storage.current,
        limit: response.storage.limit,
        percentage: response.storage.percentage,
        unit: response.storage.unit as 'MB' | 'GB' | 'TB',
        trend: response.storage.trend,
      },
    };
  }

  /**
   * Map API response to UsageAlert array
   */
  private mapToUsageAlerts(response: UsageAlertsResponse): UsageAlert[] {
    return response.alerts.map((alert) => ({
      id: alert.id,
      type: alert.type as 'contacts' | 'emails' | 'storage' | 'apiCalls',
      threshold: alert.threshold,
      current: alert.current,
      limit: alert.limit,
      message: alert.message,
      severity: alert.severity as 'warning' | 'critical',
      createdAt: new Date(alert.createdAt),
    }));
  }
}
