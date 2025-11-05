import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { Subject, takeUntil } from 'rxjs';

import { BillingService } from '../../../services/billing.service';
import { BillingPlan, CurrentSubscription, BillingHistory } from '../../../models/billing.model';

@Component({
  selector: 'app-billing-settings',
  imports: [CommonModule, NgIcon],
  templateUrl: './billing.html',
  styleUrl: './billing.css',
})
export class BillingSettings implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  plans: BillingPlan[] = [];
  subscription: CurrentSubscription | null = null;
  billingHistory: BillingHistory[] = [];

  constructor(private billingService: BillingService) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.billingService.getPlans().pipe(takeUntil(this.destroy$)).subscribe((plans) => (this.plans = plans));
    this.billingService.getCurrentSubscription().pipe(takeUntil(this.destroy$)).subscribe((sub) => (this.subscription = sub));
    this.billingService.getBillingHistory().pipe(takeUntil(this.destroy$)).subscribe((history) => (this.billingHistory = history));
  }

  changePlan(planId: string) {
    if (confirm('Czy na pewno chcesz zmienić plan?')) {
      this.billingService.changePlan(planId).pipe(takeUntil(this.destroy$)).subscribe(() => {
        alert('Plan zmieniony pomyślnie');
        this.loadData();
      });
    }
  }

  cancelSubscription() {
    if (confirm('Czy na pewno chcesz anulować subskrypcję?')) {
      this.billingService.cancelSubscription().pipe(takeUntil(this.destroy$)).subscribe(() => {
        alert('Subskrypcja została anulowana');
        this.loadData();
      });
    }
  }

  getStatusClass(status: string): string {
    const classes = {
      active: 'bg-success/10 text-success',
      canceled: 'bg-danger/10 text-danger',
      past_due: 'bg-warning/10 text-warning',
      trialing: 'bg-info/10 text-info',
    };
    return classes[status as keyof typeof classes] || 'bg-default-200 text-default-600';
  }

  getHistoryStatusClass(status: string): string {
    const classes = {
      paid: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      failed: 'bg-danger/10 text-danger',
    };
    return classes[status as keyof typeof classes] || 'bg-default-200 text-default-600';
  }
}
