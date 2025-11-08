import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/api/api.service';
import {
  OverviewStats,
  RecentCampaigns,
  GrowthData,
  ActivityFeed
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiService = inject(ApiService);

  getOverviewStats(): Observable<OverviewStats> {
    return this.apiService.get<OverviewStats>('dashboard/overview-stats');
  }

  getRecentCampaigns(limit: number = 5): Observable<RecentCampaigns> {
    return this.apiService.get<RecentCampaigns>('dashboard/recent-campaigns', {
      params: { limit }
    });
  }

  getGrowthData(year?: number): Observable<GrowthData> {
    const params = year ? { year } : undefined;
    return this.apiService.get<GrowthData>('dashboard/growth-data', {
      params
    });
  }

  getActivityFeed(limit: number = 10): Observable<ActivityFeed> {
    return this.apiService.get<ActivityFeed>('dashboard/activity-feed', {
      params: { limit }
    });
  }
}
