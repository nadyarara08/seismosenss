// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', loadComponent: () => import('./home/home.page').then(m => m.HomePage) },
  { path: 'devices', loadComponent: () => import('./devices/devices.page').then(m => m.DevicesPage) },
  { path: 'map', loadComponent: () => import('./map/map.page').then(m => m.MapPage) },
  { path: 'settings', loadComponent: () => import('./settings/settings.page').then(m => m.SettingsPage) },
  { path: 'profile', loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage) },
  { path: 'services', loadComponent: () => import('./services/services.page').then(m => m.ServicesPage) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.page').then(m => m.DashboardPage) },
  { path: 'map-tangram', loadComponent: () => import('./map/map.page').then(m => m.MapPage) },  

];
