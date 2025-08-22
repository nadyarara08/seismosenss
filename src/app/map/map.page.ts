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

  map!: L.Map;
  markers: L.Marker[] = [];
  allMarkers: L.Marker[] = [];
  currentFilter: string = 'all';
  isMapInitialized: boolean = false;

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
    console.log('ionViewDidEnter called');
    
    setTimeout(() => {
      console.log('Starting map initialization...');
      this.initializeMap();
    }, 300);

    setTimeout(() => {
      if (this.map) {
        console.log('First additional refresh');
        this.map.invalidateSize(true);
        this.fitToMarkers();
      }
    }, 800);
    
    setTimeout(() => {
      if (this.map) {
        console.log('Second additional refresh');
        this.forceMapRefresh();
      }
    }, 1500);

    setInterval(() => this.updateStats(), 5000);
    setInterval(() => this.updateTime(), 60000);
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
      this.map = null as any;
      this.markers = [];
      this.allMarkers = [];
      this.isMapInitialized = false;
    }
  }

  initializeMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map element not found');
      setTimeout(() => this.initializeMap(), 500);
      return;
    }

    const rect = mapElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn('Map element has no dimensions, retrying...');
      setTimeout(() => this.initializeMap(), 300);
      return;
    }

    if (this.map) {
      this.destroyMap();
    }

    try {
      this.map = L.map('map', {
        center: [-7.5755, 110.8243],
        zoom: 13,
        zoomControl: false,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true,
        preferCanvas: false,
        renderer: L.canvas()
      });

      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 10,
        crossOrigin: true
      });

      tileLayer.on('tileerror', (error) => {
        console.warn('Tile loading error, trying alternative:', error);
        const fallbackLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
          minZoom: 10
        });
        fallbackLayer.addTo(this.map);
      });

      tileLayer.addTo(this.map);

      this.map.whenReady(() => {
        console.log('Map is ready');
        this.isMapInitialized = true;
        
        this.map.invalidateSize(true);
        
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize(true);
            this.addSensorMarkers();
          }
        }, 100);
        
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize(true);
            if (this.allMarkers.length > 0) {
              this.fitToMarkers();
            }
          }
        }, 500);
      });

      this.map.on('resize', () => {
        if (this.map) {
          this.map.invalidateSize(true);
        }
      });

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize(true);
        }
      }, 100);

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize(true);
        }
      }, 500);

    } catch (error) {
      console.error('Error initializing map:', error);
      setTimeout(() => this.initializeMap(), 1000);
    }
  }

  addSensorMarkers() {
    if (!this.map || !this.isMapInitialized) {
      console.warn('Map not ready for markers');
      return;
    }

    this.markers = [];
    this.allMarkers = [];

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
    const iconHtml = this.getMarkerIcon(sensor.status);
    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const marker = L.marker([sensor.lat, sensor.lng], { icon: customIcon });
    
    const popupContent = `
      <div class="sensor-popup">
        <h4>${sensor.name}</h4>
        <p><strong>Kategori:</strong> ${sensor.category}</p>
        <p><strong>Alamat:</strong> ${sensor.address}</p>
        <span class="status-badge ${sensor.status}">${this.getStatusText(sensor)}</span>
        ${sensor.health ? `<p><strong>Health:</strong> ${sensor.health}%</p>` : ''}
      </div>
    `;
    
    marker.bindPopup(popupContent, {
      maxWidth: 250,
      className: 'custom-popup'
    });
    
    return marker;
  }

  getMarkerIcon(status: string): string {
    const colors: any = {
      normal: '#10b981',
      warning: '#f59e0b',
      offline: '#ef4444',
      user: '#3b82f6'
    };
    const color = colors[status] || '#6b7280';
    return `<div style="width:16px;height:16px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>`;
  }

  // Map controls - Fixed functionality
  zoomIn() { 
    if (this.map && this.isMapInitialized) {
      console.log('Zoom in clicked');
      this.map.zoomIn();
    }
  }
  
  zoomOut() { 
    if (this.map && this.isMapInitialized) {
      console.log('Zoom out clicked');
      this.map.zoomOut();
    }
  }
  
  centerMap() { 
    if (this.map && this.isMapInitialized) {
      console.log('Center map clicked');
      this.map.setView([-7.5755, 110.8243], 13);
    }
  }
  
  fitToMarkers() {
    if (this.allMarkers.length > 0 && this.map && this.isMapInitialized) {
      try {
        const group = L.featureGroup(this.allMarkers);
        this.map.fitBounds(group.getBounds(), { padding: [20, 20], maxZoom: 16 });
      } catch (error) {
        console.error('Error fitting to markers:', error);
      }
    }
  }

  // 🔹 Tambahan method baru
  forceMapRefresh() {
    if (this.map && this.isMapInitialized) {
      console.log('Force refreshing map...');
      
      this.map.invalidateSize({ animate: false, pan: false });
      
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize({ animate: true, pan: false });
          const center = this.map.getCenter();
          this.map.panTo(center);
        }
      }, 100);
      
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize({ animate: false, pan: true });
          this.map.eachLayer((layer: any) => {
            if (layer.redraw) {
              layer.redraw();
            }
          });
        }
      }, 300);
    }
  }

  adjustToLocation(event: any) {
    const loc = this.sensorLocations.find(l => l.id === event.detail.value);
    if (loc && this.map && this.isMapInitialized) {
      this.map.setView([loc.lat, loc.lng], 16, { animate: true, duration: 1 });
    }
  }

  updateStats() {
    const uptime = parseFloat(this.cityUptime.replace('%', ''));
    const newValue = uptime + (Math.random() - 0.5) * 0.5;
    this.cityUptime = `${Math.max(90, Math.min(100, newValue)).toFixed(1)}%`;
    
    this.legendItems = this.legendItems.map(item => ({
      ...item,
      count: item.count + Math.floor((Math.random() - 0.5) * 10)
    }));
  }

  updateTime() {
    const now = new Date();
    console.log("⏰ Time:", now.toLocaleTimeString());
  }

  // ========== Template helpers ==========
  filterMarkers(filterType: string) {
    if (!this.map || !this.isMapInitialized) return;

    this.currentFilter = filterType;
    this.filterOptions.forEach(option => option.active = option.id === filterType);

    // Remove all markers first
    this.markers.forEach(marker => {
      if (this.map.hasLayer(marker)) {
        this.map.removeLayer(marker);
      }
    });

    // Add filtered markers
    if (filterType === 'all') {
      this.allMarkers.forEach(marker => {
        if (!this.map.hasLayer(marker)) {
          marker.addTo(this.map);
        }
      });
    } else {
      this.allMarkers.forEach((marker, index) => {
        const sensor = this.sensorLocations[index];
        if (sensor?.status === filterType && !this.map.hasLayer(marker)) {
          marker.addTo(this.map);
        }
      });
    }

    // Fit to visible markers after filtering
    setTimeout(() => {
      this.fitToMarkers();
    }, 100);
  }

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

  showLocationDetail(locationName: string) {
    const location = this.sensorLocations.find(loc => loc.name === locationName);
    if (!location) return;
    
    // Enhanced detail popup
    const statusEmoji = location.status === 'normal' ? '✅' : 
                       location.status === 'warning' ? '⚠️' : 
                       location.status === 'offline' ? '❌' : '📱';
    
    alert(`${statusEmoji} ${location.name}\n📍 ${location.category}\n📍 ${location.address}\nStatus: ${this.getStatusText(location)}`);
    
    // Focus map on location
    if (this.map && this.isMapInitialized) {
      this.map.setView([location.lat, location.lng], 16, {
        animate: true,
        duration: 1
      });
    }
  }

  showDeviceDetail(deviceId: string) {
    const device = this.sensorLocations.find(d => d.id === deviceId);
    if (!device) return;
    
    let statusText = device.health && device.health > 0 ? 
      `✅ ${device.name} berfungsi normal` : 
      `❌ ${device.name} tidak terhubung`;
    
    alert(`${statusText}\nKategori: ${device.category}\nAlamat: ${device.address}\nHealth: ${device.health || 0}%`);
    
    // Focus map on device
    if (this.map && this.isMapInitialized) {
      this.map.setView([device.lat, device.lng], 16, {
        animate: true,
        duration: 1
      });
    }
  }

  // Method untuk refresh map jika ada masalah
  refreshMap() {
    if (this.map) {
      setTimeout(() => {
        this.map.invalidateSize(true);
        this.fitToMarkers();
      }, 100);
    }
  }

  // Method khusus untuk fix square container
  forceMapResize() {
    if (this.map && this.isMapInitialized) {
      // Multiple resize attempts
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize(true);
            // Force redraw tiles
            this.map.eachLayer((layer: any) => {
              if (layer.redraw) {
                layer.redraw();
              }
            });
          }
        }, i * 200);
      }
    }
  }
}