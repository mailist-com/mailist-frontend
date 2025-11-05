import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { BillingService } from '../../../services/billing.service';
import { BillingPlan, CurrentSubscription, BillingHistory } from '../../../models/billing.model';

@Component({
  selector: 'app-billing-settings',
  imports: [CommonModule, NgIcon, FormsModule, TranslateModule],
  templateUrl: './billing.html',
  styleUrl: './billing.css',
})
export class BillingSettings implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  plans: BillingPlan[] = [];
  subscription: CurrentSubscription | null = null;
  billingHistory: BillingHistory[] = [];

  // Slider configuration
  selectedContacts: number = 2500;
  minContacts: number = 500;
  maxContacts: number = 50000;
  stepContacts: number = 500;

  constructor(private billingService: BillingService) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.billingService.getPlans().pipe(takeUntil(this.destroy$)).subscribe((plans) => {
      this.plans = plans;
    });
    this.billingService.getCurrentSubscription().pipe(takeUntil(this.destroy$)).subscribe((sub) => {
      this.subscription = sub;
      if (sub && sub.contacts) {
        this.selectedContacts = sub.contacts;
      }
    });
    this.billingService.getBillingHistory().pipe(takeUntil(this.destroy$)).subscribe((history) => (this.billingHistory = history));
  }

  /**
   * Get price for plan based on selected contacts
   */
  getPriceForPlan(plan: BillingPlan): number {
    if (plan.isFree || !plan.pricingTiers || plan.pricingTiers.length === 0) {
      return plan.price;
    }

    // Find the appropriate tier
    let selectedTier = plan.pricingTiers[0];
    for (const tier of plan.pricingTiers) {
      if (this.selectedContacts >= tier.contacts) {
        selectedTier = tier;
      } else {
        break;
      }
    }

    return selectedTier.price;
  }

  /**
   * Format contacts number with thousands separator
   */
  formatContacts(value: number): string {
    return value.toLocaleString('pl-PL');
  }

  /**
   * Handle slider change
   */
  onContactsChange() {
    // Update is handled by ngModel
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
