import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel, IonTabs } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, RouterModule],
  template: `
    <ion-app>
      <ion-tabs>
        <ion-router-outlet></ion-router-outlet>

        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="home" [routerLink]="['/home']">
            <ion-icon name="home"></ion-icon>
            <ion-label>Beranda</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="devices" [routerLink]="['/devices']">
            <ion-icon name="phone-portrait"></ion-icon>
            <ion-label>Perangkat</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="map" [routerLink]="['/map']">
            <ion-icon name="map"></ion-icon>
            <ion-label>Peta</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="settings" [routerLink]="['/settings']">
            <ion-icon name="settings"></ion-icon>
            <ion-label>Pengaturan</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="profile" [routerLink]="['/profile']">
            <ion-icon name="person"></ion-icon>
            <ion-label>Profil</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-app>
  `
})
export class AppComponent {}
