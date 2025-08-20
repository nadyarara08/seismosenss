import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home.page').then(m => m.HomePage) },
  { path: 'devices', loadComponent: () => import('./devices/devices.page').then(m => m.DevicesPage) },
  { path: 'map', loadComponent: () => import('./map/map.page').then(m => m.MapPage) },
  { path: 'settings', loadComponent: () => import('./settings/settings.page').then(m => m.SettingsPage) },
  { path: 'profile', loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage) },
  {
    path: 'devices',
    loadComponent: () => import('./devices/devices.page').then( m => m.DevicesPage)
  },
  {
    path: 'map',
    loadComponent: () => import('./map/map.page').then( m => m.MapPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then( m => m.SettingsPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage)
  },
];
