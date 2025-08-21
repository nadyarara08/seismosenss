import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOutline, analyticsOutline, addCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements AfterViewInit {

  constructor() {
    addIcons({ notificationsOutline, analyticsOutline, addCircleOutline });
  }

  ngAfterViewInit() {
    this.updateTime();
    setInterval(() => this.updateStats(), 5000);
  }

  showNotifications() {
    alert('🔔 Notifikasi:\n\n• SMS-USER-003 offline sejak 2 jam lalu\n• Firmware update tersedia untuk SMS-USER-001\n• Sistem monitoring berjalan normal');
  }

  showDetail() {
    alert('📊 Monitoring Real-time:\n\nMenampilkan grafik aktivitas seismik dalam 24 jam terakhir.\n\nFitur lengkap akan tersedia di versi final aplikasi.');
  }

  showAllDevices() {
    alert('📱 Semua Perangkat:\n\n• SMS-USER-001 - Online\n• SMS-USER-002 - Online\n• SMS-USER-003 - Offline\n\nTotal: 3 perangkat terdaftar');
  }

  addDevice() {
    alert('➕ Tambah Perangkat:\n\nFitur untuk menambahkan perangkat SeismoSens baru akan tersedia di versi lengkap aplikasi.\n\nDemo mode - Indonesia Inventors Day 2025');
  }

  updateStats() {
    console.log('Update stats running...');
  }

  updateTime() {
    console.log('⏰', new Date().toLocaleTimeString());
  }
}
