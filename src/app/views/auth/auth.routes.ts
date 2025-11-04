import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./login/login').then(m => m.Login),
        data: { title: 'Login' }
      },
      {
        path: 'register',
        loadComponent: () => import('./register/register').then(m => m.Register),
        data: { title: 'Register' }
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./reset-password/reset-password').then(m => m.ResetPassword),
        data: { title: 'Reset Password' }
      }
    ]
  }
];