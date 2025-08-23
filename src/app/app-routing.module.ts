import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

// Guard (opsional, bisa dipakai kalau masih butuh kontrol akses)
import { AuthGuard } from './guards/auth.guards';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard/home',
    pathMatch: 'full'
  },

  // ✅ DASHBOARD (bottom nav container)
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [AuthGuard], // kalau tidak perlu guard, hapus saja baris ini
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then(m => m.HomePage)
      },
      {
        path: 'devices',
        loadComponent: () => import('./devices/devices.page').then(m => m.DevicesPage)
      },
      {
        path: 'map',
        loadComponent: () => import('./map/map.page').then(m => m.MapPage)
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings.page').then(m => m.SettingsPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },

  // ✅ fallback kalau route tidak ada
  {
    path: '**',
    redirectTo: 'dashboard/home'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}