import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { Subject, takeUntil } from 'rxjs';

import { UsageService } from '../../../services/usage.service';
import { UsageStatistics, UsageMetric } from '../../../models/usage.model';

@Component({
  selector: 'app-usage-settings',
  imports: [CommonModule, NgIcon],
  templateUrl: './usage.html',
  styleUrl: './usage.css',
})
export class UsageSettings implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  statistics: UsageStatistics | null = null;

  constructor(private usageService: UsageService) {}

  ngOnInit() {
    this.usageService.getUsageStatistics().pipe(takeUntil(this.destroy$)).subscribe((stats) => (this.statistics = stats));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUsageClass(metric: UsageMetric): string {
    if (metric.limit === -1) return 'text-info';
    if (metric.percentage >= 90) return 'text-danger';
    if (metric.percentage >= 75) return 'text-warning';
    return 'text-success';
  }

  getProgressClass(metric: UsageMetric): string {
    if (metric.limit === -1) return 'bg-info';
    if (metric.percentage >= 90) return 'bg-danger';
    if (metric.percentage >= 75) return 'bg-warning';
    return 'bg-success';
  }
}
