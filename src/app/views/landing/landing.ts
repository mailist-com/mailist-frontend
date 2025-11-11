import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  imports: [ RouterLink, CommonModule ],
  templateUrl: './landing.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Landing {
  features = [
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

  stats = [
    { value: '50K+', label: 'Active Users' },
    { value: '10M+', label: 'Emails Sent' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'User Rating' }
  ];

  plans = [
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

  testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechCorp',
      image: '',
      content: 'Mailist has transformed our email marketing. The automation features alone have saved us countless hours while improving our engagement rates by 40%.'
    },
    {
      name: 'Michael Chen',
      role: 'CEO',
      company: 'StartupXYZ',
      image: '',
      content: 'The best email marketing platform we\'ve used. Intuitive, powerful, and the support team is always there when we need them.'
    },
    {
      name: 'Emma Williams',
      role: 'E-commerce Manager',
      company: 'ShopNow',
      image: '',
      content: 'Our conversion rates have doubled since switching to Mailist. The segmentation and personalization features are game-changers.'
    }
  ];

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
