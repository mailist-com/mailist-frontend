import {Routes} from "@angular/router";

export const VIEWS_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/auths.routes').then((mod) => mod.AUTHS_ROUTES)
  },
  {
    path: '',
    loadChildren: () => import('./dashboards/dashboards.routes').then((mod) => mod.DASHBOARDS_ROUTES)
  },

  {
    path: '',
    loadChildren: () => import('./apps/apps.routes').then((mod) => mod.APPS_ROUTES)
  },
  {
    path: '',
    loadChildren: () => import('./ecommerce/ecommerce.routes').then((mod) => mod.ECOMMERCE_ROUTES)
  },
  {
    path: '',
    loadChildren: () => import('./hr-management/management.routes').then((mod) => mod.MANAGEMENT_ROUTES)
  },
  {
    path: '',
    loadChildren: () => import('./invoice/invoice.routes').then((mod) => mod.INVOICE_ROUTES)
  },
  {
    path: '',
    loadChildren: () => import('./users/users.routes').then((mod) => mod.USERS_ROUTES)
  },
  {
    path: '',
    loadChildren: () => import('./contacts/contacts.routes').then((mod) => mod.CONTACTS_ROUTES)
  },
  {
    path: 'automations',
    loadChildren: () => import('./automations/automations.routes').then((mod) => mod.AUTOMATIONS_ROUTES)
  },
  {
    path: 'templates',
    loadChildren: () => import('./templates/templates.routes').then((mod) => mod.TEMPLATES_ROUTES)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.routes').then((mod) => mod.SETTINGS_ROUTES)
  },
  {
    path: 'campaigns',
    loadChildren: () => import('./campaigns/campaigns.routes').then((mod) => mod.CAMPAIGNS_ROUTES)
  },
  {
    path: 'integrations',
    loadChildren: () => import('./integrations/integrations.routes').then((mod) => mod.INTEGRATIONS_ROUTES)
  },
  {
    path: '',
    loadChildren: () => import('./extra/extra.routes').then((mod) => mod.EXTRA_ROUTES)
  },
  {
    path: '',
    loadChildren: () => import('./layouts/layout.routes').then((mod) => mod.LAYOUT_ROUTES)
  },
]
