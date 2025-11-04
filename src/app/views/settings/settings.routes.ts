import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./settings/settings').then(m => m.Settings),
        data: { title: 'Settings' }
      }
    ]
  }
];
