import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'landing-cta',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './cta.component.html',
  styleUrls: ['./cta.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CtaComponent {}
