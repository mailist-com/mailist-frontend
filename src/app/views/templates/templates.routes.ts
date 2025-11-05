import { Routes } from '@angular/router';

export const TEMPLATES_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./templates-list/templates-list').then(m => m.TemplatesList),
        data: { title: 'Szablony' }
      },
      {
        path: 'create',
        loadComponent: () => import('./template-form/template-form').then(m => m.TemplateForm),
        data: { title: 'Nowy szablon' }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./template-form/template-form').then(m => m.TemplateForm),
        data: { title: 'Edytuj szablon' }
      }
    ]
  }
];
