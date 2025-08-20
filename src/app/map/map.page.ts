import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFab, IonFabButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, remove, locate } from 'ionicons/icons';
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
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonFab, IonFabButton, IonIcon],
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss']
})
export class MapPage implements AfterViewInit, OnDestroy {

  map!: L.Map;
  markers: L.Marker[] = [];
  allMarkers: L.Marker[] = []; // Store all markers for filtering
  currentFilter: string = 'all';

  // Filter options
  filterOptions: FilterType[] = [
    { id: 'all', label: 'Semua', active: true },
    { id: 'normal', label: 'Normal', active: false },
    { id: 'warning', label: 'Warning', active: false },
    { id: 'offline', label: 'Offline', active: false },
    { id: 'user', label: 'Milik Saya', active: false }
  ];

  // Legend data
  legendItems: LegendItem[] = [
    { color: '#10b981', label: 'Normal', count: 1156 },
    { color: '#f59e0b', label: 'Warning', count: 23 },
    { color: '#ef4444', label: 'Offline', count: 8 },
    { color: '#3b82f6', label: 'Perangkat Anda', count: 3 }
  ];

  // Sensor locations (sample data for Surakarta)
  sensorLocations: SensorLocation[] = [
    // User devices
    {
      id: 'SMS-USER-001',
      name: 'SMS-USER-001',
      lat: -7.5694,
      lng: 110.8192,
      status: 'user',
      description: 'Rumah Tinggal • Jl. Slamet Riyadi No. 234',
      category: 'Rumah Tinggal',
      address: 'Jl. Slamet Riyadi No. 234',
      health: 95
    },
    {
      id: 'SMS-USER-002',
      name: 'SMS-USER-002',
      lat: -7.5755,
      lng: 110.8243,
      status: 'user',
      description: 'Kantor • Jl. Dr. Rajiman No. 45',
      category: 'Kantor',
      address: 'Jl. Dr. Rajiman No. 45',
      health: 78
    },
    {
      id: 'SMS-USER-003',
      name: 'SMS-USER-003',
      lat: -7.5601,
      lng: 110.8315,
      status: 'user',
      description: 'Gudang • Jl. Adi Sucipto No. 12',
      category: 'Gudang',
      address: 'Jl. Adi Sucipto No. 12',
      health: 0
    },
    // Public locations
    {
      id: 'BALAI-KOTA',
      name: 'Balai Kota Surakarta',
      lat: -7.5663,
      lng: 110.8281,
      status: 'normal',
      description: 'Pemerintahan • Jl. Jend. Sudirman',
      distance: '0.8 km',
      category: 'Pemerintahan',
      address: 'Jl. Jend. Sudirman'
    },
    {
      id: 'RSUD-MOEWARDI',
      name: 'RSUD Dr. Moewardi',
      lat: -7.5589,
      lng: 110.8204,
      status: 'normal',
      description: 'Rumah Sakit • Jl. Kol. Sutarto',
      distance: '1.2 km',
      category: 'Rumah Sakit',
      address: 'Jl. Kol. Sutarto'
    },
    {
      id: 'UNS-KENTINGAN',
      name: 'UNS Kentingan',
      lat: -7.5812,
      lng: 110.8372,
      status: 'warning',
      description: 'Universitas • Jl. Ir. Sutami',
      distance: '2.1 km',
      category: 'Universitas',
      address: 'Jl. Ir. Sutami'
    },
    {
      id: 'KERATON',
      name: 'Keraton Surakarta',
      lat: -7.5711,
      lng: 110.8243,
      status: 'normal',
      description: 'Budaya • Jl. Brigjen Slamet Riyadi',
      distance: '1.8 km',
      category: 'Budaya',
      address: 'Jl. Brigjen Slamet Riyadi'
    }
  ];

  constructor() {
    addIcons({ add, remove, locate });
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  initializeMap() {
    // Initialize map centered on Surakarta
    this.map = L.map('map', {
      zoomControl: false // Remove default zoom controls
    }).setView([-7.5755, 110.8243], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(this.map);

    // Add markers for all sensor locations
    this.addSensorMarkers();
  }

  addSensorMarkers() {
    this.sensorLocations.forEach(sensor => {
      const marker = this.createMarker(sensor);
      marker.addTo(this.map);
      this.markers.push(marker);
      this.allMarkers.push(marker);
    });
  }

  createMarker(sensor: SensorLocation): L.Marker {
    // Create custom icon based on status
    const iconHtml = this.getMarkerIcon(sensor.status);
    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // Create marker
    const marker = L.marker([sensor.lat, sensor.lng], { icon: customIcon });

    // Add popup
    const popupContent = `
      <div class="sensor-popup">
        <h4>${sensor.name}</h4>
        <p>${sensor.description}</p>
        <div class="status-badge ${sensor.status}">
          ${this.getStatusText(sensor.status)}
        </div>
      </div>
    `;
    
    marker.bindPopup(popupContent);

    return marker;
  }

  getMarkerIcon(status: string): string {
    const colors = {
      normal: '#10b981',
      warning: '#f59e0b',
      offline: '#ef4444',
      user: '#3b82f6'
    };

    const color = colors[status as keyof typeof colors] || '#6b7280';
    
    return `
      <div style="
        width: 16px; 
        height: 16px; 
        background: ${color}; 
        border: 2px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `;
  }

  getStatusText(status: string): string {
    const statusMap = {
      normal: '● Normal',
      warning: '⚠ Warning',
      offline: '● Offline',
      user: '📱 Perangkat Anda'
    };
    return statusMap[status as keyof typeof statusMap] || '● Unknown';
  }

  // Map control methods
  zoomIn() {
    if (this.map) {
      this.map.zoomIn();
    }
  }

  zoomOut() {
    if (this.map) {
      this.map.zoomOut();
    }
  }

  centerMap() {
    if (this.map) {
      this.map.setView([-7.5755, 110.8243], 13);
    }
  }

  // Get total sensor count
  getTotalSensors(): number {
    return this.legendItems.reduce((total, item) => total + item.count, 0);
  }

  // Filter functionality
  filterMarkers(filterType: string) {
    this.currentFilter = filterType;
    
    // Update filter button states
    this.filterOptions.forEach(option => {
      option.active = option.id === filterType;
    });

    // Remove all markers from map
    this.markers.forEach(marker => {
      this.map.removeLayer(marker);
    });

    // Add filtered markers back
    if (filterType === 'all') {
      this.allMarkers.forEach(marker => {
        marker.addTo(this.map);
      });
    } else {
      this.allMarkers.forEach((marker, index) => {
        const sensor = this.sensorLocations[index];
        if (sensor.status === filterType) {
          marker.addTo(this.map);
        }
      });
    }
  }

  // Location detail methods
  showLocationDetail(locationName: string) {
    const location = this.sensorLocations.find(loc => loc.name === locationName);
    if (location) {
      let statusIcon = '';
      let healthInfo = '';
      
      switch (location.status) {
        case 'normal':
          statusIcon = '✅';
          break;
        case 'warning':
          statusIcon = '⚠️';
          healthInfo = '\n• Perlu pemeliharaan berkala';
          break;
        case 'offline':
          statusIcon = '❌';
          healthInfo = '\n• Periksa koneksi jaringan';
          break;
        case 'user':
          statusIcon = '📱';
          healthInfo = location.health ? `\n• Health: ${location.health}%` : '\n• Status: Offline';
          break;
      }
      
      alert(`${statusIcon} ${location.name}\n\n📍 ${location.category}\n${location.address}${location.distance ? `\n🚗 ${location.distance} dari lokasi Anda` : ''}${healthInfo}`);
    }
  }

  showDeviceDetail(deviceId: string) {
    const device = this.sensorLocations.find(d => d.id === deviceId);
    if (device && device.status === 'user') {
      let statusText = device.health && device.health > 0 ? 
        `✅ ${device.name} berfungsi normal` : 
        `❌ ${device.name} tidak terhubung`;
      
      let details = device.health && device.health > 0 ? 
        `• Health: ${device.health}%\n• Status: Online\n• Last Update: Aktif sekarang` :
        `• Status: Offline\n• Last Seen: 2 jam lalu\n• Periksa koneksi internet`;
      
      alert(`${statusText}\n\n📍 ${device.category}\n${device.address}\n\n${details}`);
    }
  }

  // Stats data
  getTotalActive(): number {
    return 1187;
  }

  getCityUptime(): string {
    return '97.4%';
  }

  // Get public locations (not user devices)
  getPublicLocations(): SensorLocation[] {
    return this.sensorLocations.filter(location => location.status !== 'user');
  }

  // Get user devices
  getUserDevices(): SensorLocation[] {
    return this.sensorLocations.filter(location => location.status === 'user');
  }
}