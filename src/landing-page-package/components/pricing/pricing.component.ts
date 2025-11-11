import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

@Component({
  selector: 'landing-pricing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PricingComponent {
  @Input() plans: PricingPlan[] = [
    {
      name: 'Starter',
      price: '9',
      period: 'month',
      description: 'Perfect for individuals and small teams',
      features: [
        'Up to 1,000 subscribers',
        '10,000 emails per month',
        'Basic email templates',
        'Email support',
        'Basic analytics'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '29',
      period: 'month',
      description: 'Ideal for growing businesses',
      features: [
        'Up to 10,000 subscribers',
        'Unlimited emails',
        'Advanced templates',
        'Priority support',
        'Advanced analytics',
        'Marketing automation',
        'A/B testing'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '99',
      period: 'month',
      description: 'For large organizations',
      features: [
        'Unlimited subscribers',
        'Unlimited emails',
        'Custom templates',
        '24/7 phone support',
        'Custom analytics',
        'Advanced automation',
        'Dedicated account manager',
        'API access'
      ],
      popular: false
    }
  ];
}
