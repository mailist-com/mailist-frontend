export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: PlanFeature[];
  limits: PlanLimits;
  popular?: boolean;
  pricingTiers?: PricingTier[];
  isFree?: boolean;
}

export interface PricingTier {
  contacts: number;
  price: number;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number;
}

export interface PlanLimits {
  contacts: number;
  emailsPerMonth: number;
  users: number;
  automations: number;
  templates: number;
  apiCalls: number;
}

export interface CurrentSubscription {
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  contacts?: number;
}

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface BillingHistory {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
  description: string;
}
