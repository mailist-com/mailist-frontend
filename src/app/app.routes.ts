import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./views/landing/landing').then(m => m.Landing),
        pathMatch: 'full',
    },
    {
        path: '',
        loadChildren: () => import('./views/auth/auth.routes').then((mod) => mod.AUTH_ROUTES),
        canActivate: [guestGuard]
    },
    {
        path: '',
        component: MainLayout,
        loadChildren: () => import('./views/views.routes').then((mod) => mod.VIEWS_ROUTES),
        canActivate: [authGuard]
    }
];

