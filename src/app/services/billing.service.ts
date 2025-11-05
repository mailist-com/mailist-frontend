import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {
  BillingPlan,
  CurrentSubscription,
  PaymentMethod,
  BillingHistory,
} from '../models/billing.model';

@Injectable({
  providedIn: 'root',
})
export class BillingService {
  private subscriptionSubject = new BehaviorSubject<CurrentSubscription>(
    this.getMockSubscription()
  );
  public subscription$ = this.subscriptionSubject.asObservable();

  constructor() {}

  /**
   * Get available billing plans
   */
  getPlans(): Observable<BillingPlan[]> {
    return of(this.getMockPlans());
  }

  /**
   * Get current subscription
   */
  getCurrentSubscription(): Observable<CurrentSubscription> {
    return of(this.subscriptionSubject.value);
  }

  /**
   * Change subscription plan
   */
  changePlan(planId: string): Observable<CurrentSubscription> {
    const plans = this.getMockPlans();
    const newPlan = plans.find((p) => p.id === planId);

    if (!newPlan) {
      return throwError(() => new Error('Plan nie znaleziony'));
    }

    const updatedSubscription: CurrentSubscription = {
      ...this.subscriptionSubject.value,
      planId: newPlan.id,
      planName: newPlan.name,
      price: newPlan.price,
      interval: newPlan.interval,
    };

    this.subscriptionSubject.next(updatedSubscription);
    return of(updatedSubscription);
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(): Observable<CurrentSubscription> {
    const updatedSubscription: CurrentSubscription = {
      ...this.subscriptionSubject.value,
      cancelAtPeriodEnd: true,
      status: 'canceled',
    };

    this.subscriptionSubject.next(updatedSubscription);
    return of(updatedSubscription);
  }

  /**
   * Reactivate subscription
   */
  reactivateSubscription(): Observable<CurrentSubscription> {
    const updatedSubscription: CurrentSubscription = {
      ...this.subscriptionSubject.value,
      cancelAtPeriodEnd: false,
      status: 'active',
    };

    this.subscriptionSubject.next(updatedSubscription);
    return of(updatedSubscription);
  }

  /**
   * Get payment methods
   */
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return of(this.getMockPaymentMethods());
  }

  /**
   * Add payment method
   */
  addPaymentMethod(paymentMethod: Partial<PaymentMethod>): Observable<PaymentMethod> {
    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: paymentMethod.type || 'card',
      last4: paymentMethod.last4,
      brand: paymentMethod.brand,
      expiryMonth: paymentMethod.expiryMonth,
      expiryYear: paymentMethod.expiryYear,
      isDefault: false,
    };

    return of(newMethod);
  }

  /**
   * Remove payment method
   */
  removePaymentMethod(methodId: string): Observable<boolean> {
    return of(true);
  }

  /**
   * Get billing history
   */
  getBillingHistory(): Observable<BillingHistory[]> {
    return of(this.getMockBillingHistory());
  }

  /**
   * Get mock plans
   */
  private getMockPlans(): BillingPlan[] {
    return [
      {
        id: 'plan_free',
        name: 'Free',
        price: 0,
        currency: 'PLN',
        interval: 'month',
        isFree: true,
        features: [
          { name: 'Do 500 kontaktów', included: true },
          { name: 'Do 1,000 emaili/miesiąc', included: true },
          { name: '1 użytkownik', included: true },
          { name: '1 kampania', included: true },
          { name: '1 automatyzacja', included: true },
          { name: 'Podstawowe szablony', included: true },
          { name: 'Wsparcie email', included: true },
          { name: 'API dostęp', included: false },
        ],
        limits: {
          contacts: 500,
          emailsPerMonth: 1000,
          users: 1,
          automations: 1,
          templates: 10,
          apiCalls: 0,
        },
      },
      {
        id: 'plan_standard',
        name: 'Standard',
        price: 49,
        currency: 'PLN',
        interval: 'month',
        popular: true,
        pricingTiers: [
          { contacts: 500, price: 49 },
          { contacts: 1000, price: 79 },
          { contacts: 2500, price: 129 },
          { contacts: 5000, price: 199 },
          { contacts: 10000, price: 299 },
          { contacts: 25000, price: 499 },
          { contacts: 50000, price: 799 },
        ],
        features: [
          { name: 'Dynamiczny limit kontaktów', included: true },
          { name: 'Nielimitowane emaile', included: true },
          { name: 'Do 3 użytkowników', included: true },
          { name: 'Nielimitowane kampanie', included: true },
          { name: 'Nielimitowane automatyzacje', included: true },
          { name: 'Wszystkie szablony', included: true },
          { name: 'Priorytetowe wsparcie', included: true },
          { name: 'API dostęp (5,000/miesiąc)', included: true },
        ],
        limits: {
          contacts: 500,
          emailsPerMonth: -1,
          users: 3,
          automations: -1,
          templates: -1,
          apiCalls: 5000,
        },
      },
      {
        id: 'plan_professional',
        name: 'Professional',
        price: 99,
        currency: 'PLN',
        interval: 'month',
        pricingTiers: [
          { contacts: 500, price: 99 },
          { contacts: 1000, price: 149 },
          { contacts: 2500, price: 249 },
          { contacts: 5000, price: 399 },
          { contacts: 10000, price: 599 },
          { contacts: 25000, price: 999 },
          { contacts: 50000, price: 1599 },
        ],
        features: [
          { name: 'Dynamiczny limit kontaktów', included: true },
          { name: 'Nielimitowane emaile', included: true },
          { name: 'Do 5 użytkowników', included: true },
          { name: 'Nielimitowane kampanie', included: true },
          { name: 'Nielimitowane automatyzacje', included: true },
          { name: 'Wszystkie szablony', included: true },
          { name: 'Dedykowany account manager', included: true },
          { name: 'API dostęp (25,000/miesiąc)', included: true },
        ],
        limits: {
          contacts: 500,
          emailsPerMonth: -1,
          users: 5,
          automations: -1,
          templates: -1,
          apiCalls: 25000,
        },
      },
    ];
  }

  /**
   * Get mock subscription
   */
  private getMockSubscription(): CurrentSubscription {
    return {
      planId: 'plan_standard',
      planName: 'Standard',
      status: 'active',
      currentPeriodStart: new Date('2025-11-01'),
      currentPeriodEnd: new Date('2025-12-01'),
      cancelAtPeriodEnd: false,
      price: 129,
      currency: 'PLN',
      interval: 'month',
      contacts: 2500,
    };
  }

  /**
   * Get mock payment methods
   */
  private getMockPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: 'pm_1',
        type: 'card',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true,
      },
      {
        id: 'pm_2',
        type: 'card',
        last4: '5555',
        brand: 'Mastercard',
        expiryMonth: 8,
        expiryYear: 2025,
        isDefault: false,
      },
    ];
  }

  /**
   * Get mock billing history
   */
  private getMockBillingHistory(): BillingHistory[] {
    return [
      {
        id: 'inv_1',
        date: new Date('2025-11-01'),
        amount: 129,
        currency: 'PLN',
        status: 'paid',
        invoiceUrl: '#',
        description: 'Standard Plan (2,500 kontaktów) - Listopad 2025',
      },
      {
        id: 'inv_2',
        date: new Date('2025-10-01'),
        amount: 129,
        currency: 'PLN',
        status: 'paid',
        invoiceUrl: '#',
        description: 'Standard Plan (2,500 kontaktów) - Październik 2025',
      },
      {
        id: 'inv_3',
        date: new Date('2025-09-01'),
        amount: 79,
        currency: 'PLN',
        status: 'paid',
        invoiceUrl: '#',
        description: 'Standard Plan (1,000 kontaktów) - Wrzesień 2025',
      },
      {
        id: 'inv_4',
        date: new Date('2025-08-01'),
        amount: 49,
        currency: 'PLN',
        status: 'paid',
        invoiceUrl: '#',
        description: 'Standard Plan (500 kontaktów) - Sierpień 2025',
      },
    ];
  }
}
