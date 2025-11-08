import { Component, OnInit, inject } from '@angular/core';
import { NgIcon } from "@ng-icons/core";
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../../../services/dashboard.service';
import { ActivityItem } from '../../../../../models/dashboard.model';

type Activity = {
  icon: string;
  title: string;
  description: string;
  time: string;
  iconBg: string;
  iconColor: string;
};

@Component({
  selector: 'app-activity-feed',
  imports: [NgIcon, CommonModule],
  templateUrl: './activity-feed.html',
  styles: ``
})
export class ActivityFeed implements OnInit {
  private dashboardService = inject(DashboardService);

  activities: Activity[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadActivities();
  }

  private loadActivities() {
    this.dashboardService.getActivityFeed(10).subscribe({
      next: (data) => {
        this.activities = data.activities.map((item: ActivityItem) => this.mapActivity(item));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading activity feed:', err);
        this.error = 'Nie udało się załadować aktywności';
        this.loading = false;
        this.activities = [];
      }
    });
  }

  private mapActivity(item: ActivityItem): Activity {
    const typeMap: { [key: string]: { bg: string; color: string } } = {
      'campaign_sent': { bg: 'bg-blue-50 dark:bg-blue-500/10', color: 'text-blue-600 dark:text-blue-400' },
      'contact_added': { bg: 'bg-green-50 dark:bg-green-500/10', color: 'text-green-600 dark:text-green-400' },
      'automation_triggered': { bg: 'bg-purple-50 dark:bg-purple-500/10', color: 'text-purple-600 dark:text-purple-400' }
    };

    const mapping = typeMap[item.type] || { bg: 'bg-gray-50 dark:bg-gray-500/10', color: 'text-gray-600 dark:text-gray-400' };

    return {
      icon: item.icon,
      title: item.type === 'campaign_sent' ? 'Kampania wysłana' : item.message,
      description: item.message,
      time: this.formatTime(item.timestamp),
      iconBg: mapping.bg,
      iconColor: mapping.color
    };
  }

  private formatTime(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Przed chwilą';
      if (diffMins < 60) return `${diffMins} min temu`;
      if (diffHours < 24) return `${diffHours}h temu`;
      if (diffDays < 7) return `${diffDays} dni temu`;

      return date.toLocaleDateString('pl-PL');
    } catch {
      return timestamp;
    }
  }
}
