import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';

export const routes: Routes = [
  {
    path: 'sign-in',
    title: 'Sign in | Task Management',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/sign-in/sign-in.component').then(m => m.SignInComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./core/layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Home | Task Management',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: '**',
        title: 'Not found | Task Management',
        loadComponent: () => import('./shared/not-found/not-found.component').then(m => m.NotFoundComponent)
      }
    ]
  }
];
