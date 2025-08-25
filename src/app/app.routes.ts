// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'onboarding', 
    pathMatch: 'full' 
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./onboarding/onboarding.page').then(m => m.OnboardingPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.page').then(m => m.RegisterPage)
  },
  { 
    path: 'home', 
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    canActivate: [AuthGuard]
  },
  { 
    path: 'devices', 
    loadComponent: () => import('./devices/devices.page').then(m => m.DevicesPage),
    canActivate: [AuthGuard]
  },
  { 
    path: 'map', 
    loadComponent: () => import('./map/map.page').then(m => m.MapPage),
    canActivate: [AuthGuard]
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./settings/settings.page').then(m => m.SettingsPage),
    canActivate: [AuthGuard]
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage),
    canActivate: [AuthGuard]
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [AuthGuard]
  },
  { 
    path: '**',
    redirectTo: 'onboarding',
    pathMatch: 'full'
  }
];
