# Mailist Landing Page Package

A professional, standalone Angular landing page package inspired by industry-leading email marketing platforms like MailerLite and ActiveCampaign. This package is fully modular, customizable, and ready to be extracted into a separate repository.

## Features

- **Standalone Components**: All components are standalone and can be used independently
- **Fully Responsive**: Works seamlessly across all device sizes
- **Dark Mode Support**: Built-in dark mode styling
- **Customizable**: Easy to customize colors, content, and styles
- **Type-Safe**: Full TypeScript support with exported interfaces
- **Modern Design**: Clean, professional UI inspired by top email marketing platforms
- **Smooth Animations**: Hover effects and smooth scrolling
- **SEO-Friendly**: Semantic HTML structure

## Components

### Main Component
- **LandingPageComponent**: The main orchestrator that combines all sub-components

### Sub-Components
- **HeaderComponent**: Fixed navigation header with scroll-to-section functionality
- **HeroComponent**: Hero section with CTA, stats, and gradient background
- **FeaturesComponent**: Feature grid showcasing key capabilities
- **TestimonialsComponent**: Customer testimonials with star ratings
- **PricingComponent**: Pricing cards with highlight for popular plan (inspired by billing component)
- **CtaComponent**: Call-to-action section with primary CTAs
- **FooterComponent**: Comprehensive footer with links and social media

## Installation

### Option 1: Use within existing project

```typescript
import { LandingPageComponent } from './landing-page-package';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LandingPageComponent],
  template: '<app-landing-page></app-landing-page>'
})
export class AppComponent {}
```

### Option 2: Extract to separate repository

1. Copy the `landing-page-package` folder to your new repository
2. Install peer dependencies:
   ```bash
   npm install @angular/common @angular/core @angular/router
   ```
3. Import and use components as needed

## Usage

### Using the Complete Landing Page

```typescript
import { Component } from '@angular/core';
import { LandingPageComponent } from '@mailist/landing-page';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [LandingPageComponent],
  template: '<app-landing-page></app-landing-page>'
})
export class Landing {}
```

### Using Individual Components

```typescript
import { Component } from '@angular/core';
import {
  HeaderComponent,
  HeroComponent,
  PricingComponent,
  type HeroStat,
  type PricingPlan
} from '@mailist/landing-page';

@Component({
  selector: 'app-custom-landing',
  standalone: true,
  imports: [HeaderComponent, HeroComponent, PricingComponent],
  template: `
    <landing-header (scrollToSection)="scrollToSection($event)"></landing-header>
    <landing-hero [stats]="stats"></landing-hero>
    <landing-pricing [plans]="plans"></landing-pricing>
  `
})
export class CustomLanding {
  stats: HeroStat[] = [
    { value: '50K+', label: 'Active Users' }
  ];

  plans: PricingPlan[] = [
    {
      name: 'Starter',
      price: '9',
      period: 'month',
      description: 'Perfect for small teams',
      features: ['Feature 1', 'Feature 2'],
      popular: false
    }
  ];

  scrollToSection(sectionId: string): void {
    // Implementation
  }
}
```

## Customization

### Theming

Customize the primary colors by overriding CSS variables in your global styles:

```css
:root {
  --primary-color: #your-brand-color;
  --primary-hover-color: #your-brand-hover-color;
}
```

### Content Customization

All components accept `@Input()` properties for easy customization:

```typescript
// Customize Hero stats
stats: HeroStat[] = [
  { value: '100K+', label: 'Happy Customers' },
  { value: '5M+', label: 'Messages Sent' }
];

// Customize Features
features: Feature[] = [
  {
    icon: 'lucide:rocket',
    title: 'Fast Performance',
    description: 'Lightning-fast email delivery'
  }
];

// Customize Pricing
plans: PricingPlan[] = [
  {
    name: 'Basic',
    price: '19',
    period: 'month',
    description: 'For small businesses',
    features: ['5,000 contacts', 'Email support'],
    popular: false
  }
];

// Customize Testimonials
testimonials: Testimonial[] = [
  {
    name: 'John Doe',
    role: 'CEO',
    company: 'Tech Inc',
    content: 'Amazing platform!'
  }
];
```

## Component APIs

### HeroComponent

**Inputs:**
- `stats: HeroStat[]` - Array of statistics to display

**Outputs:**
- `scrollToSection: EventEmitter<string>` - Emits section ID to scroll to

**Types:**
```typescript
interface HeroStat {
  value: string;
  label: string;
}
```

### FeaturesComponent

**Inputs:**
- `features: Feature[]` - Array of features to display

**Types:**
```typescript
interface Feature {
  icon: string;
  title: string;
  description: string;
}
```

### TestimonialsComponent

**Inputs:**
- `testimonials: Testimonial[]` - Array of testimonials to display

**Types:**
```typescript
interface Testimonial {
  name: string;
  role: string;
  company: string;
  image?: string;
  content: string;
}
```

### PricingComponent

**Inputs:**
- `plans: PricingPlan[]` - Array of pricing plans to display

**Types:**
```typescript
interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}
```

### HeaderComponent & FooterComponent

**Outputs:**
- `scrollToSection: EventEmitter<string>` - Emits section ID to scroll to

## Dependencies

### Required Peer Dependencies
- `@angular/common: ^20.0.0`
- `@angular/core: ^20.0.0`
- `@angular/router: ^20.0.0`

### Required for Icons
- `iconify-icon` - For displaying Lucide icons

## Styling

All components use scoped CSS with the following conventions:

- **Class Prefix**: All classes are prefixed with `landing-` to avoid conflicts
- **Dark Mode**: Fully responsive to system dark mode preferences
- **Responsive**: Mobile-first design with breakpoints at 640px, 768px, and 1024px
- **Colors**: Use CSS variables for easy theming

### Pricing Component Styles

The pricing component features styles inspired by the application's billing component:

- Card-based layout with hover effects
- Popular plan highlighting with scale and shadow
- Responsive grid layout (1 column mobile, 3 columns desktop)
- Feature lists with checkmarks
- Clear CTA buttons with distinct styling for popular plans

## File Structure

```
landing-page-package/
├── components/
│   ├── header/
│   │   ├── header.component.ts
│   │   ├── header.component.html
│   │   └── header.component.css
│   ├── footer/
│   │   ├── footer.component.ts
│   │   ├── footer.component.html
│   │   └── footer.component.css
│   ├── hero/
│   │   ├── hero.component.ts
│   │   ├── hero.component.html
│   │   └── hero.component.css
│   ├── features/
│   │   ├── features.component.ts
│   │   ├── features.component.html
│   │   └── features.component.css
│   ├── testimonials/
│   │   ├── testimonials.component.ts
│   │   ├── testimonials.component.html
│   │   └── testimonials.component.css
│   ├── pricing/
│   │   ├── pricing.component.ts
│   │   ├── pricing.component.html
│   │   └── pricing.component.css
│   └── cta/
│       ├── cta.component.ts
│       ├── cta.component.html
│       └── cta.component.css
├── landing-page.component.ts
├── landing-page.component.html
├── landing-page.component.css
├── index.ts
├── package.json
└── README.md
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Credits

Design inspired by:
- [MailerLite](https://www.mailerlite.com)
- [ActiveCampaign](https://www.activecampaign.com)

## Contributing

When extracting to a separate repository:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues and questions, please open an issue on the GitHub repository.
