import { Routes } from '@angular/router';

export const INTEGRATIONS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./integrations/integrations').then(m => m.Integrations),
        data: { title: 'Integracje' }
      }
    ]
  }
];
