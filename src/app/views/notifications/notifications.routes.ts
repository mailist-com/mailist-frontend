import { Routes } from '@angular/router';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: 'notifications',
    loadComponent: () => import('./notifications-list').then(m => m.NotificationsListComponent),
    data: { title: 'Powiadomienia' }
  }
];
