import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, ToastController, AlertController, ActionSheetController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOutline, analyticsOutline, addCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements AfterViewInit, OnDestroy {

  totalDevices = 3;
  onlineDevices = 2;
  avgHealth = 90;
  currentTime = new Date().toLocaleTimeString();

  private intervalId: any;

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController
  ) {
    addIcons({ notificationsOutline, analyticsOutline, addCircleOutline });
  }

  ngAfterViewInit() {
    this.updateTime();
    this.intervalId = setInterval(() => {
      this.updateTime();
      this.updateStats();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // 🔔 Notifikasi
  async showNotifications() {
    const alert = await this.alertCtrl.create({
      header: 'Notifikasi',
      message: `
        🔔 SMS-USER-003 offline sejak 2 jam lalu <br>
        🔔 Firmware update tersedia untuk SMS-USER-001 <br>
        ✅ Sistem monitoring berjalan normal
      `,
      buttons: ['OK']
    });
    await alert.present();
  }

  // 📊 Detail Monitoring
  async showDetail() {
    const toast = await this.toastCtrl.create({
      message: '📊 Grafik monitoring real-time akan tersedia di versi final.',
      duration: 3000,
      color: 'primary',
      position: 'bottom'
    });
    await toast.present();
  }

  // 📱 Semua Perangkat
  async showAllDevices() {
    const alert = await this.alertCtrl.create({
      header: 'Semua Perangkat',
      message: `
        • SMS-USER-001 - Online <br>
        • SMS-USER-002 - Online <br>
        • SMS-USER-003 - Offline <br><br>
        Total: ${this.totalDevices} perangkat
      `,
      buttons: ['OK']
    });
    await alert.present();
  }

  // ➕ Tambah Perangkat
  async addDevice() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Tambah Perangkat',
      buttons: [
        { text: 'Scan QR Code', icon: 'qr-code-outline', handler: () => console.log('Scan QR dipilih') },
        { text: 'Input Manual', icon: 'create-outline', handler: () => console.log('Input manual dipilih') },
        { text: 'Batal', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  // ⏰ Update waktu real-time
  updateTime() {
    this.currentTime = new Date().toLocaleTimeString();
  }

  // 📊 Update statistik (dummy simulasi)
  updateStats() {
    // random biar keliatan berubah
    this.onlineDevices = Math.floor(Math.random() * this.totalDevices) + 1;
    this.avgHealth = 70 + Math.floor(Math.random() * 30); // 70–100%
    console.log('Stats updated:', this.onlineDevices, this.avgHealth, this.currentTime);
  }
}