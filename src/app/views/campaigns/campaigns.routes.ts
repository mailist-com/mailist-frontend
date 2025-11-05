
import { Routes } from '@angular/router';

export const CAMPAIGNS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./campaign-list/campaign-list').then(m => m.CampaignList),
        data: { title: 'Kampanie' }
      },
      {
        path: 'create',
        loadComponent: () => import('./campaign-form/campaign-form').then(m => m.CampaignForm),
        data: { title: 'Nowa kampania' }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./campaign-form/campaign-form').then(m => m.CampaignForm),
        data: { title: 'Edytuj kampanię' }
      },
      {
        path: ':id',
        loadComponent: () => import('./campaign-details/campaign-details').then(m => m.CampaignDetails),
        data: { title: 'Szczegóły kampanii' }
      },
      {
        path: ':id/stats',
        loadComponent: () => import('./campaign-stats/campaign-stats').then(m => m.CampaignStats),
        data: { title: 'Statystyki kampanii' }
      }
    ]
  }
];
