import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonFab, 
  IonFabButton, 
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonSelect,
  IonSelectOption 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, remove, locate, expand, checkmarkCircle, warning, closeCircle } from 'ionicons/icons';

import * as L from 'leaflet';

interface SensorLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'normal' | 'warning' | 'offline' | 'user';
  description?: string;
  distance?: string;
  category?: string;
  address?: string;
  health?: number;
}

interface LegendItem {
  color: string;
  label: string;
  count: number;
}

interface FilterType {
  id: string;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonFab, 
    IonFabButton, 
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonSelect,
    IonSelectOption
  ]
})
export class MapPage implements OnDestroy {

  private map!: L.Map;
  private markers: L.LayerGroup = L.layerGroup();

  cityUptime: string = '97.4%';

  filterOptions: FilterType[] = [
    { id: 'all', label: 'Semua', active: true },
    { id: 'normal', label: 'Normal', active: false },
    { id: 'warning', label: 'Warning', active: false },
    { id: 'offline', label: 'Offline', active: false },
    { id: 'user', label: 'Milik Saya', active: false }
  ];

  legendItems: LegendItem[] = [
    { color: '#10b981', label: 'Normal', count: 1156 },
    { color: '#f59e0b', label: 'Warning', count: 23 },
    { color: '#ef4444', label: 'Offline', count: 8 },
    { color: '#3b82f6', label: 'Perangkat Anda', count: 3 }
  ];

  sensorLocations: SensorLocation[] = [
    { id: 'SMS-USER-001', name: 'SMS-USER-001', lat: -7.5694, lng: 110.8192, status: 'user', category: 'Rumah Tinggal', address: 'Jl. Slamet Riyadi No. 234', health: 99, distance: '1.2 km' },
    { id: 'SMS-USER-002', name: 'SMS-USER-002', lat: -7.5755, lng: 110.8243, status: 'user', category: 'Kantor', address: 'Jl. Dr. Rajiman No. 45', health: 78, distance: '0.8 km' },
    { id: 'SMS-USER-003', name: 'SMS-USER-003', lat: -7.5601, lng: 110.8315, status: 'user', category: 'Gudang', address: 'Jl. Adi Sucipto No. 12', health: 0, distance: '2.1 km' },
    { id: 'BALAI-KOTA', name: 'Balai Kota Surakarta', lat: -7.5663, lng: 110.8281, status: 'normal', category: 'Pemerintahan', address: 'Jl. Jend. Sudirman', distance: '0.8 km' },
    { id: 'RSUD-MOEWARDI', name: 'RSUD Dr. Moewardi', lat: -7.5589, lng: 110.8204, status: 'normal', category: 'Rumah Sakit', address: 'Jl. Kol. Sutarto', distance: '1.2 km' },
    { id: 'UNS-KENTINGAN', name: 'UNS Kentingan', lat: -7.5812, lng: 110.8372, status: 'warning', category: 'Universitas', address: 'Jl. Ir. Sutami', distance: '2.1 km' },
    { id: 'KERATON', name: 'Keraton Surakarta', lat: -7.5711, lng: 110.8243, status: 'normal', category: 'Budaya', address: 'Jl. Brigjen Slamet Riyadi', distance: '1.8 km' }
  ];

  constructor() {
    addIcons({ add, remove, locate, expand, checkmarkCircle, warning, closeCircle });
  }

  ionViewDidEnter() {
    setTimeout(() => this.initializeMap(), 300);
  }

  ionViewWillLeave() {
    this.destroyMap();
  }

  ngOnDestroy() {
    this.destroyMap();
  }

  private destroyMap() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map element not found');
      return;
    }

    // ⬇️ konfigurasi lengkap (zoom, scroll, controls aktif)
    this.map = L.map(mapElement, {
      center: [-7.5755, 110.8243],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markers.addTo(this.map);
    this.addSensorMarkers();
  }

  private addSensorMarkers() {
    this.markers.clearLayers();
    this.sensorLocations.forEach(sensor => {
      const color = this.getMarkerColor(sensor.status);
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:${color}; width:14px; height:14px; border-radius:50%; border:2px solid white;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([sensor.lat, sensor.lng], { icon })
        .bindPopup(`<b>${sensor.name}</b><br>${sensor.category || ''}<br>${sensor.address || ''}`);

      // ⬇️ event klik biar muncul alert juga
      marker.on('click', () => {
        alert(`Anda mengklik ${sensor.name}\nStatus: ${this.getStatusText(sensor)}`);
      });

      this.markers.addLayer(marker);
    });
  }

  private getMarkerColor(status: string): string {
    const colors: any = {
      normal: '#10b981',
      warning: '#f59e0b',
      offline: '#ef4444',
      user: '#3b82f6'
    };
    return colors[status] || '#6b7280';
  }

  // ================== Statistik ==================
  getTotalActive(): number {
    return this.sensorLocations.filter(s => s.status === 'normal' || s.status === 'user').length;
  }

  getCityUptime(): string {
    return this.cityUptime;
  }

  getPublicLocations(): SensorLocation[] {
    return this.sensorLocations.filter(location => location.status !== 'user');
  }

  getUserDevices(): SensorLocation[] {
    return this.sensorLocations.filter(location => location.status === 'user');
  }

  getStatusText(sensor: SensorLocation): string {
    switch (sensor.status) {
      case 'normal': return '● Normal';
      case 'warning': return '⚠ Warning';
      case 'offline': return '● Offline';
      case 'user': return '📱 Perangkat Anda';
      default: return '● Unknown';
    }
  }

  // ================== Kontrol Zoom ==================
  zoomIn() {
    if (this.map) this.map.zoomIn();
  }

  zoomOut() {
    if (this.map) this.map.zoomOut();
  }

  centerMap() {
    if (this.map) this.map.setView([-7.5755, 110.8243], 13);
  }
}
