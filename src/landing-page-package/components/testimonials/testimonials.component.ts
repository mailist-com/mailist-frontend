import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  image?: string;
  content: string;
}

@Component({
  selector: 'landing-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TestimonialsComponent {
  @Input() testimonials: Testimonial[] = [
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

  stars = [1, 2, 3, 4, 5];
}
