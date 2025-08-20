import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, IonBadge, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { warning, checkmarkCircle, closeCircle } from 'ionicons/icons';

interface Device {
  id: string;
  name: string;
  location: string;
  address: string;
  status: 'online' | 'warning' | 'offline';
  percentage?: number;
  lastSeen?: string;
}

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent, IonBadge, IonIcon],
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss']
})
export class DevicesPage {

  devices: Device[] = [
    {
      id: 'SMS-USER-001',
      name: 'SMS-USER-001',
      location: 'Rumah Tinggal',
      address: 'Jl. Slamet Riyadi No. 234',
      status: 'online',
      percentage: 95,
      lastSeen: 'Aktif sekarang'
    },
    {
      id: 'SMS-USER-002',
      name: 'SMS-USER-002',
      location: 'Kantor',
      address: 'Jl. Dr. Rajiman No. 45',
      status: 'warning',
      percentage: 78,
      lastSeen: '5 menit lalu'
    },
    {
      id: 'SMS-USER-003',
      name: 'SMS-USER-003',
      location: 'Gudang',
      address: 'Jl. Adi Sucipto No. 12',
      status: 'offline',
      lastSeen: '2 jam lalu'
    }
  ];

  constructor() {
    addIcons({ warning, checkmarkCircle, closeCircle });
  }

  showDeviceDetail(deviceId: string) {
    const device = this.devices.find(d => d.id === deviceId);
    if (device) {
      let statusText = '';
      let details = '';
      
      switch (device.status) {
        case 'online':
          statusText = `✅ ${device.name} berfungsi normal`;
          details = `• Sinyal: ${device.percentage}%\n• Battery: Good\n• Last Update: ${device.lastSeen}`;
          break;
        case 'warning':
          statusText = `⚠️ ${device.name} memerlukan perhatian`;
          details = `• Sinyal: ${device.percentage}%\n• Battery: Low\n• Last Update: ${device.lastSeen}`;
          break;
        case 'offline':
          statusText = `❌ ${device.name} tidak terhubung`;
          details = `• Status: Offline\n• Last Seen: ${device.lastSeen}\n• Periksa koneksi internet`;
          break;
      }
      
      alert(`${statusText}\n\n📍 ${device.location}\n${device.address}\n\n${details}`);
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'online': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'offline': return 'close-circle';
      default: return 'help-circle';
    }
  }

  getStatusText(device: Device): string {
    switch (device.status) {
      case 'online': return `● Online (${device.percentage}%)`;
      case 'warning': return `⚠ Warning (${device.percentage}%)`;
      case 'offline': return '● Offline';
      default: return '● Unknown';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'online': return 'success';
      case 'warning': return 'warning';
      case 'offline': return 'danger';
      default: return 'medium';
    }
  }
}