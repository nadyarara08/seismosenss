import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPage } from './dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
    children: [
      { path: 'home', loadComponent: () => import('../home/home.page').then(m => m.HomePage) },
      { path: 'devices', loadComponent: () => import('../devices/devices.page').then(m => m.DevicesPage) },
      { path: 'map', loadComponent: () => import('../map/map.page').then(m => m.MapPage) },
      { path: 'settings', loadComponent: () => import('../settings/settings.page').then(m => m.SettingsPage) },
      { path: 'profile', loadComponent: () => import('../profile/profile.page').then(m => m.ProfilePage) },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
