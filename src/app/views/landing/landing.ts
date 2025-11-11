import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LandingPageComponent } from '../../../landing-page-package/landing-page.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [LandingPageComponent],
  template: '<app-landing-page></app-landing-page>',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Landing {}
