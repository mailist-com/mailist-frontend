import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface HeroStat {
  value: string;
  label: string;
}

@Component({
  selector: 'landing-hero',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HeroComponent {
  @Input() stats: HeroStat[] = [
    { value: '50K+', label: 'Active Users' },
    { value: '10M+', label: 'Emails Sent' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'User Rating' }
  ];

  @Output() scrollToSection = new EventEmitter<string>();

  onScrollToSection(sectionId: string): void {
    this.scrollToSection.emit(sectionId);
  }
}
