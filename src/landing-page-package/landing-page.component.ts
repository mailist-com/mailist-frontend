import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { HeroComponent, HeroStat } from './components/hero/hero.component';
import { FeaturesComponent, Feature } from './components/features/features.component';
import { TestimonialsComponent, Testimonial } from './components/testimonials/testimonials.component';
import { PricingComponent, PricingPlan } from './components/pricing/pricing.component';
import { CtaComponent } from './components/cta/cta.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    FeaturesComponent,
    TestimonialsComponent,
    PricingComponent,
    CtaComponent,
    FooterComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingPageComponent {
  stats: HeroStat[] = [
    { value: '50K+', label: 'Active Users' },
    { value: '10M+', label: 'Emails Sent' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'User Rating' }
  ];

  features: Feature[] = [
    {
      icon: 'lucide:mail',
      title: 'Email Campaigns',
      description: 'Create beautiful email campaigns with our drag-and-drop builder. Send personalized messages to your audience.'
    },
    {
      icon: 'lucide:users',
      title: 'Contact Management',
      description: 'Organize and segment your contacts effortlessly. Build targeted lists for better engagement.'
    },
    {
      icon: 'lucide:workflow',
      title: 'Marketing Automation',
      description: 'Set up automated workflows to nurture leads and engage customers at the right time.'
    },
    {
      icon: 'lucide:layout-template',
      title: 'Template Library',
      description: 'Choose from hundreds of professionally designed templates or create your own.'
    },
    {
      icon: 'lucide:bar-chart-3',
      title: 'Analytics & Reporting',
      description: 'Track opens, clicks, and conversions with detailed analytics and insights.'
    },
    {
      icon: 'lucide:shield-check',
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with GDPR compliance and data protection built-in.'
    }
  ];

  testimonials: Testimonial[] = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechCorp',
      content: 'Mailist has transformed our email marketing. The automation features alone have saved us countless hours while improving our engagement rates by 40%.'
    },
    {
      name: 'Michael Chen',
      role: 'CEO',
      company: 'StartupXYZ',
      content: 'The best email marketing platform we\'ve used. Intuitive, powerful, and the support team is always there when we need them.'
    },
    {
      name: 'Emma Williams',
      role: 'E-commerce Manager',
      company: 'ShopNow',
      content: 'Our conversion rates have doubled since switching to Mailist. The segmentation and personalization features are game-changers.'
    }
  ];

  plans: PricingPlan[] = [
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

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
