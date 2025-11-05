import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of, throwError } from 'rxjs';
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
    return of(this.getMockPlans()).pipe(delay(400));
  }

  /**
   * Get current subscription
   */
  getCurrentSubscription(): Observable<CurrentSubscription> {
    return of(this.subscriptionSubject.value).pipe(delay(300));
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
    return of(updatedSubscription).pipe(delay(1000));
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
    return of(updatedSubscription).pipe(delay(800));
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
    return of(updatedSubscription).pipe(delay(800));
  }

  /**
   * Get payment methods
   */
  getPaymentMethods(): Observable<PaymentMethod[]> {
    return of(this.getMockPaymentMethods()).pipe(delay(400));
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

    return of(newMethod).pipe(delay(1000));
  }

  /**
   * Remove payment method
   */
  removePaymentMethod(methodId: string): Observable<boolean> {
    return of(true).pipe(delay(500));
  }

  /**
   * Get billing history
   */
  getBillingHistory(): Observable<BillingHistory[]> {
    return of(this.getMockBillingHistory()).pipe(delay(400));
  }

  /**
   * Get mock plans
   */
  private getMockPlans(): BillingPlan[] {
    return [
      {
        id: 'plan_starter',
        name: 'Starter',
        price: 49,
        currency: 'PLN',
        interval: 'month',
        features: [
          { name: 'Do 1,000 kontaktów', included: true },
          { name: 'Do 10,000 emaili/miesiąc', included: true },
          { name: '1 użytkownik', included: true },
          { name: '5 automatyzacji', included: true },
          { name: 'Podstawowe szablony', included: true },
          { name: 'Wsparcie email', included: true },
          { name: 'Zaawansowane segmentacje', included: false },
          { name: 'API dostęp', included: false },
        ],
        limits: {
          contacts: 1000,
          emailsPerMonth: 10000,
          users: 1,
          automations: 5,
          templates: 20,
          apiCalls: 0,
        },
      },
      {
        id: 'plan_professional',
        name: 'Professional',
        price: 149,
        currency: 'PLN',
        interval: 'month',
        popular: true,
        features: [
          { name: 'Do 10,000 kontaktów', included: true },
          { name: 'Do 100,000 emaili/miesiąc', included: true },
          { name: 'Do 5 użytkowników', included: true },
          { name: 'Nielimitowane automatyzacje', included: true },
          { name: 'Wszystkie szablony', included: true },
          { name: 'Priorytetowe wsparcie', included: true },
          { name: 'Zaawansowane segmentacje', included: true },
          { name: 'API dostęp (10,000/miesiąc)', included: true },
        ],
        limits: {
          contacts: 10000,
          emailsPerMonth: 100000,
          users: 5,
          automations: -1,
          templates: -1,
          apiCalls: 10000,
        },
      },
      {
        id: 'plan_enterprise',
        name: 'Enterprise',
        price: 499,
        currency: 'PLN',
        interval: 'month',
        features: [
          { name: 'Nielimitowane kontakty', included: true },
          { name: 'Nielimitowane emaile', included: true },
          { name: 'Nielimitowani użytkownicy', included: true },
          { name: 'Nielimitowane automatyzacje', included: true },
          { name: 'Wszystkie szablony', included: true },
          { name: 'Dedykowany account manager', included: true },
          { name: 'Zaawansowane segmentacje', included: true },
          { name: 'Nielimitowany API dostęp', included: true },
        ],
        limits: {
          contacts: -1,
          emailsPerMonth: -1,
          users: -1,
          automations: -1,
          templates: -1,
          apiCalls: -1,
        },
      },
    ];
  }

  /**
   * Get mock subscription
   */
  private getMockSubscription(): CurrentSubscription {
    return {
      planId: 'plan_professional',
      planName: 'Professional',
      status: 'active',
      currentPeriodStart: new Date('2025-11-01'),
      currentPeriodEnd: new Date('2025-12-01'),
      cancelAtPeriodEnd: false,
      price: 149,
      currency: 'PLN',
      interval: 'month',
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
        amount: 149,
        currency: 'PLN',
        status: 'paid',
        invoiceUrl: '#',
        description: 'Professional Plan - Listopad 2025',
      },
      {
        id: 'inv_2',
        date: new Date('2025-10-01'),
        amount: 149,
        currency: 'PLN',
        status: 'paid',
        invoiceUrl: '#',
        description: 'Professional Plan - Październik 2025',
      },
      {
        id: 'inv_3',
        date: new Date('2025-09-01'),
        amount: 149,
        currency: 'PLN',
        status: 'paid',
        invoiceUrl: '#',
        description: 'Professional Plan - Wrzesień 2025',
      },
      {
        id: 'inv_4',
        date: new Date('2025-08-01'),
        amount: 49,
        currency: 'PLN',
        status: 'paid',
        invoiceUrl: '#',
        description: 'Starter Plan - Sierpień 2025',
      },
    ];
  }
}
