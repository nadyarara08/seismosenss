export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
  deviceCount: number;
  detectionCount: number;
  alertsSent: number;
  premiumUntil?: Date;
  subscription: 'free' | 'premium' | 'enterprise';
  preferences: UserPreferences;
  profile: UserProfile;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  organization?: string;
  position?: string;
  bio?: string;
  avatar?: string;
  language: string;
  timezone: string;
  notifications: NotificationSettings;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  units: 'metric' | 'imperial';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  autoBackup: boolean;
  dataRetention: number; // days
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface NotificationSettings {
  email: {
    earthquakeAlerts: boolean;
    deviceStatus: boolean;
    systemUpdates: boolean;
    newsletter: boolean;
  };
  push: {
    earthquakeAlerts: boolean;
    deviceStatus: boolean;
    systemUpdates: boolean;
    criticalAlerts: boolean;
  };
  sms: {
    earthquakeAlerts: boolean;
    criticalAlerts: boolean;
  };
}

export interface UserStats {
  totalDetections: number;
  deviceCount: number;
  alertsSent: number;
  uptime: number; // percentage
  dataUsage: number; // MB
  lastActivity: Date;
  joinedDate: Date;
  subscriptionStatus: 'active' | 'inactive' | 'expired';
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'detection' | 'usage' | 'contribution' | 'milestone';
}

export interface Device {
  id: string;
  name: string;
  type: 'sensor' | 'station' | 'mobile';
  status: 'online' | 'offline' | 'maintenance' | 'error';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    altitude?: number;
  };
  specs: {
    model: string;
    version: string;
    sensitivity: number;
    frequency: number;
    batteryLevel?: number;
    signalStrength?: number;
  };
  lastSeen: Date;
  createdAt: Date;
  owner: string; // user uid
  isPublic: boolean;
  detectionCount: number;
  dataPoints: number;
}