import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { Subject, takeUntil } from 'rxjs';

import { UsageService } from '../../../services/usage.service';
import { UsageStatistics, UsageMetric, UsageAlert, StorageMetric } from '../../../models/usage.model';
import { PageTitle } from '../../../components/page-title/page-title';

@Component({
  selector: 'app-usage-settings',
  imports: [CommonModule, NgIcon, PageTitle],
  templateUrl: './usage.html',
  styleUrl: './usage.css',
})
export class UsageSettings implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  statistics: UsageStatistics | null = null;
  alerts: UsageAlert[] = [];

  constructor(private usageService: UsageService) {}

  ngOnInit() {
    this.usageService.getUsageStatistics().pipe(takeUntil(this.destroy$)).subscribe((stats) => (this.statistics = stats));
    this.usageService.getUsageAlerts().pipe(takeUntil(this.destroy$)).subscribe((alerts) => (this.alerts = alerts));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUsageClass(metric: UsageMetric): string {
    if (metric.limit === -1) return 'text-default-700';
    if (metric.percentage >= 90) return 'text-danger';
    if (metric.percentage >= 75) return 'text-warning';
    return 'text-default-900';
  }

  getProgressClass(metric: UsageMetric): string {
    if (metric.limit === -1) return 'bg-info';
    if (metric.percentage >= 90) return 'bg-danger';
    if (metric.percentage >= 75) return 'bg-warning';
    return 'bg-success';
  }

  getTrendIcon(trend?: number): string {
    if (!trend) return '';
    return trend > 0 ? 'lucideTrendingUp' : 'lucideTrendingDown';
  }

  getTrendClass(trend?: number): string {
    if (!trend) return '';
    return trend > 0 ? 'text-danger' : 'text-success';
  }

  formatStorage(metric: StorageMetric): string {
    return `${metric.current} ${metric.unit} / ${metric.limit === -1 ? '∞' : metric.limit + ' ' + metric.unit}`;
  }

  getAlertClass(severity: string): string {
    return severity === 'critical' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-warning/10 text-warning border-warning/20';
  }

  getAlertIcon(severity: string): string {
    return severity === 'critical' ? 'lucideAlertTriangle' : 'lucideAlertCircle';
  }

  getDaysRemaining(endDate: Date): number {
    return Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }
}
