import { Component, CUSTOM_ELEMENTS_SCHEMA, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'landing-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FooterComponent {
  @Output() scrollToSection = new EventEmitter<string>();

  currentYear = new Date().getFullYear();

  onScrollToSection(sectionId: string): void {
    this.scrollToSection.emit(sectionId);
  }
}
