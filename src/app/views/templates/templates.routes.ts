import { Routes } from '@angular/router';

export const TEMPLATES_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./templates-list/templates-list').then(m => m.TemplatesList),
        data: { title: 'Templates List' }
      }
    ]
  }
];
