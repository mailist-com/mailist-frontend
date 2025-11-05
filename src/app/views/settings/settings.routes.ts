import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings/settings').then(m => m.Settings),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'profile'
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile').then(m => m.ProfileSettings),
        data: { title: 'Profil - Ustawienia' }
      },
      {
        path: 'billing',
        loadComponent: () => import('./billing/billing').then(m => m.BillingSettings),
        data: { title: 'Plan i Płatności - Ustawienia' }
      },
      {
        path: 'usage',
        loadComponent: () => import('./usage/usage').then(m => m.UsageSettings),
        data: { title: 'Zużycie - Ustawienia' }
      },
      {
        path: 'team',
        loadComponent: () => import('./team/team').then(m => m.TeamSettings),
        data: { title: 'Zespół - Ustawienia' }
      }
    ]
  }
];
