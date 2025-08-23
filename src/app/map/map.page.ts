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

// 🔹 Tangram dari index.html
declare const Tangram: any;

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

  // 🔹 Ganti map jadi scene Tangram
  scene: any;
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
    setTimeout(() => this.initializeMap(), 300);
  }

  ionViewWillLeave() {
    this.destroyMap();
  }

  ngOnDestroy() {
    this.destroyMap();
  }

  private destroyMap() {
    if (this.scene) {
      this.scene.destroy();
      this.scene = null;
      this.isMapInitialized = false;
    }
  }

  initializeMap() {
    const mapElement = document.getElementById('map') as HTMLElement;
    if (!mapElement) {
      console.error('Map element not found');
      return;
    }

    try {
      // 🔹 Tangram setup
      this.scene = Tangram.map({
        scene: {
          import: [
            'https://www.nextzen.org/carto/bubble-wrap-style/10/bubble-wrap-style.zip'
          ],
          global: { sdk_mapzen_api_key: '' }
        },
        container: 'map',
        center: [-7.5755, 110.8243],
        zoom: 13
      });

      this.scene.then((mapInstance: any) => {
        console.log('Tangram map ready');
        this.isMapInitialized = true;
        this.addSensorMarkers(mapInstance);
      });

    } catch (error) {
      console.error('Error initializing Tangram:', error);
    }
  }

  // 🔹 Plot sensor sebagai marker ke Tangram
  addSensorMarkers(mapInstance: any) {
    this.sensorLocations.forEach(sensor => {
      const color = this.getMarkerColor(sensor.status);
      mapInstance.scene.addPointGeoJSON({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [sensor.lng, sensor.lat] },
        properties: { color, name: sensor.name }
      });
    });
  }

  getMarkerColor(status: string): string {
    const colors: any = {
      normal: '#10b981',
      warning: '#f59e0b',
      offline: '#ef4444',
      user: '#3b82f6'
    };
    return colors[status] || '#6b7280';
  }

  // ================== Helper/Statistik seperti aslinya ==================
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

  zoomIn(){
    if (this.scene && this.scene.getZoom) {
      this.scene.setZoom(this.scene.getZoom() + 1);
    }
  }

  zoomOut(){
    if (this.scene && this.scene.getZoom) {
      this.scene.setZoom(this.scene.getZoom() - 1);
    }
  }

  centerMap() {
    if (this.scene && this.scene.setCenter) {
      this.scene.setCenter([-7.5755, 110.8243]);
      this.scene.getZoom(13);
    }
  }

  fitToMarkers(){
    console.log("📍 Fit to all markers belum diimplementasi");
  }

  filterMarkers(filterId: string){
    console.log("🔎 Filter:", filterId);
    this.filterOptions.forEach(f => f.active = (f.id === filterId));
  }

  showLocationDetail(name: string){
    console.log("📍 Detail lokasi:", name);
  }

  showDeviceDetail(id: string){
    console.log("📱 Detail perangkat", id);
  }
}
