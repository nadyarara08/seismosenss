import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements AfterViewInit {

  ngAfterViewInit() {
    this.updateTime();
    setInterval(() => this.updateStats(), 5000);
  }

  showNotifications() {
    alert('🔔 Notifikasi:\n\n• SMS-USER-003 offline\n• Firmware update tersedia');
  }

  updateStats() {
    console.log('Update stats running...');
  }

  updateTime() {
    console.log('⏰', new Date().toLocaleTimeString());
  }
}
