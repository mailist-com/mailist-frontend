import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'landing-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FeaturesComponent {
  @Input() features: Feature[] = [
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
}
