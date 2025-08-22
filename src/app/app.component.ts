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
          <ion-tab-button tab="home" href="/home">
            <div style="font-size: 24px; margin-bottom: 4px;">🏠</div>
            <ion-label>Beranda</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="devices" href="/devices">
            <div style="font-size: 24px; margin-bottom: 4px;">📱</div>
            <ion-label>Perangkat</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="map" href="/map">
            <div style="font-size: 24px; margin-bottom: 4px;">🗺️</div>
            <ion-label>Peta</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="settings" href="/settings">
            <div style="font-size: 24px; margin-bottom: 4px;">⚙️</div>
            <ion-label>Pengaturan</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="profile" href="/profile">
            <div style="font-size: 24px; margin-bottom: 4px;">👤</div>
            <ion-label>Profil</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-app>
  `
})
export class AppComponent {}
