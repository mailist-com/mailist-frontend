
import { Routes } from '@angular/router';

export const CAMPAIGNS_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./campaign-list/campaign-list').then(m => m.CampaignList),
        data: { title: 'Kampanie' }
      }
    ]
  }
];
