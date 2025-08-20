import { Component, AfterViewInit, OnDestroy } from '@angular/core';
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
  IonCardContent 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, remove, locate, checkmarkCircle, warning, closeCircle } from 'ionicons/icons';
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
    IonCardContent
  ]
})
export class MapPage implements AfterViewInit, OnDestroy {

  map!: L.Map;
  markers: L.Marker[] = [];
  allMarkers: L.Marker[] = [];
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

  // Sensor locations for Surakarta
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
    addIcons({ 
      add, 
      remove, 
      locate, 
      checkmarkCircle, 
      warning, 
      closeCircle 
    });
  }

  ngAfterViewInit() {
    // Delay to ensure DOM is ready
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  initializeMap() {
    try {
      // Initialize map centered on Surakarta
      this.map = L.map('map', {
        center: [-7.5755, 110.8243],
        zoom: 13,
        zoomControl: false // Remove default zoom controls
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(this.map);

      // Add markers
      this.addSensorMarkers();
      
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  addSensorMarkers() {
    this.sensorLocations.forEach(sensor => {
      const marker = this.createMarker(sensor);
      if (marker) {
        marker.addTo(this.map);
        this.markers.push(marker);
        this.allMarkers.push(marker);
      }
    });
  }

  createMarker(sensor: SensorLocation): L.Marker | null {
    try {
      // Create custom icon
      const iconHtml = this.getMarkerIcon(sensor.status);
      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      // Create marker
      const marker = L.marker([sensor.lat, sensor.lng], { 
        icon: customIcon 
      });

      // Add popup
      const popupContent = this.getPopupContent(sensor);
      marker.bindPopup(popupContent);

      return marker;
    } catch (error) {
      console.error('Error creating marker:', error);
      return null;
    }
  }

  getMarkerIcon(status: string): string {
    const colors: { [key: string]: string } = {
      normal: '#10b981',
      warning: '#f59e0b',
      offline: '#ef4444',
      user: '#3b82f6'
    };

    const color = colors[status] || '#6b7280';
    
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

  getPopupContent(sensor: SensorLocation): string {
    return `
      <div class="sensor-popup">
        <h4>${sensor.name}</h4>
        <p>${sensor.description}</p>
        <div class="status-badge ${sensor.status}">
          ${this.getStatusText(sensor)}
        </div>
      </div>
    `;
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

  // Filter functionality
  filterMarkers(filterType: string) {
    this.currentFilter = filterType;
    
    // Update filter states
    this.filterOptions.forEach(option => {
      option.active = option.id === filterType;
    });

    // Remove all markers
    this.markers.forEach(marker => {
      if (this.map) {
        this.map.removeLayer(marker);
      }
    });

    // Add filtered markers
    if (filterType === 'all') {
      this.allMarkers.forEach(marker => {
        if (marker && this.map) {
          marker.addTo(this.map);
        }
      });
    } else {
      this.allMarkers.forEach((marker, index) => {
        const sensor = this.sensorLocations[index];
        if (sensor?.status === filterType && marker && this.map) {
          marker.addTo(this.map);
        }
      });
    }
  }

  // Location methods
  showLocationDetail(locationName: string) {
    const location = this.sensorLocations.find(loc => loc.name === locationName);
    if (!location) return;
    
    let statusIcon = this.getLocationIcon(location.status);
    let healthInfo = this.getLocationHealthInfo(location);
    
    const message = `${statusIcon} ${location.name}\n\n📍 ${location.category}\n${location.address}${location.distance ? `\n🚗 ${location.distance} dari lokasi Anda` : ''}${healthInfo}`;
    alert(message);
  }

  showDeviceDetail(deviceId: string) {
    const device = this.sensorLocations.find(d => d.id === deviceId);
    if (!device || device.status !== 'user') return;
    
    let statusText = device.health && device.health > 0 ? 
      `✅ ${device.name} berfungsi normal` : 
      `❌ ${device.name} tidak terhubung`;
    
    let details = device.health && device.health > 0 ? 
      `• Health: ${device.health}%\n• Status: Online\n• Last Update: Aktif sekarang` :
      `• Status: Offline\n• Last Seen: 2 jam lalu\n• Periksa koneksi internet`;
    
    const message = `${statusText}\n\n📍 ${device.category}\n${device.address}\n\n${details}`;
    alert(message);
  }

  private getLocationIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'normal': '✅',
      'warning': '⚠️',
      'offline': '❌',
      'user': '📱'
    };
    return icons[status] || '❓';
  }

  private getLocationHealthInfo(location: SensorLocation): string {
    switch (location.status) {
      case 'normal':
        return '';
      case 'warning':
        return '\n• Perlu pemeliharaan berkala';
      case 'offline':
        return '\n• Periksa koneksi jaringan';
      case 'user':
        return location.health ? `\n• Health: ${location.health}%` : '\n• Status: Offline';
      default:
        return '';
    }
  }

  // Stats methods
  getTotalActive(): number {
    return 1187;
  }

  getCityUptime(): string {
    return '97.4%';
  }

  getTotalSensors(): number {
    return this.legendItems.reduce((total, item) => total + item.count, 0);
  }

  // Get locations by type
  getPublicLocations(): SensorLocation[] {
    return this.sensorLocations.filter(location => location.status !== 'user');
  }

  getUserDevices(): SensorLocation[] {
    return this.sensorLocations.filter(location => location.status === 'user');
  }

  // Get status color for Ionic components
  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'normal': 'success',
      'warning': 'warning',
      'offline': 'danger',
      'user': 'primary'
    };
    return colorMap[status] || 'medium';
  }
}