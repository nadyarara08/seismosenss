import { Component, OnInit } from '@angular/core';
import { IonContent, IonCard, IonCardContent, IonBadge, IonIcon, IonFab, IonFabButton, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, warningOutline, closeCircle, add, ellipse, warning } from 'ionicons/icons';

interface Device {
  id: string;
  name: string;
  location: string;
  address: string;
  status: 'online' | 'warning' | 'offline';
  percentage: number;
}

@Component({
  selector: 'app-devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss'],
  standalone: true,
  imports: [IonContent, IonCard, IonCardContent, IonBadge, IonIcon, IonFab, IonFabButton]
})
export class DevicesPage implements OnInit {
  devices: Device[] = [
    {
      id: 'SMS-USER-001',
      name: 'SMS-USER-001',
      location: 'Rumah Tinggal',
      address: 'Jl. Slamet Riyadi No. 234',
      status: 'online',
      percentage: 95
    },
    {
      id: 'SMS-USER-002',
      name: 'SMS-USER-002',
      location: 'Kantor',
      address: 'Jl. Dr. Rajiman No. 45',
      status: 'warning',
      percentage: 78
    },
    {
      id: 'SMS-USER-003',
      name: 'SMS-USER-003',
      location: 'Gudang',
      address: 'Jl. Adi Sucipto No. 12',
      status: 'offline',
      percentage: 0
    }
  ];

  constructor(private alertController: AlertController) {
    addIcons({ checkmarkCircle, warningOutline, closeCircle, add, ellipse, warning });
  }

  ngOnInit() {
  }

  async onDeviceClick(device: Device) {
    const alert = await this.alertController.create({
      header: device.name,
      subHeader: `Status: ${device.status.toUpperCase()}`,
      message: `
        <strong>Device ID:</strong> ${device.id}<br>
        <strong>Status:</strong> ${device.status.toUpperCase()}<br>
        <strong>Battery:</strong> ${device.percentage}%<br><br>
        <em>Detail perangkat dalam mode demo</em>
      `,
      buttons: ['OK']
    });

    await alert.present();
  }

  async onAddDevice() {
    const alert = await this.alertController.create({
      header: 'Tambah Perangkat',
      message: 'Fitur tambah perangkat dalam mode demo. Silakan hubungi administrator untuk menambah perangkat baru.',
      buttons: ['OK']
    });

    await alert.present();
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'online':
        return 'checkmark-circle';
      case 'warning':
        return 'warning-outline';
      case 'offline':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  }

  getStatusText(device: Device): string {
    switch (device.status) {
      case 'online':
        return `Online ${device.percentage}%`;
      case 'warning':
        return `Warning ${device.percentage}%`;
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  }
}