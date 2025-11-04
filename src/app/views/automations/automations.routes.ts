
import { Routes } from '@angular/router';

export const AUTOMATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./automation-list/automation-list').then(m => m.AutomationList),
    data: { title: 'Automatyzacje' }
  },
  {
    path: 'create',
    loadComponent: () => import('./flow/flow.component').then(m => m.FlowComponent),
    data: { title: 'Kreator automatyzacji' }
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./flow/flow.component').then(m => m.FlowComponent),
    data: { title: 'Edytuj automatyzację' }
  },
];
