export interface Alert {
  id: string;
  type: 'earthquake' | 'device' | 'system' | 'maintenance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  acknowledged: boolean;
  userId: string;
  deviceId?: string;
  eventId?: string;
  actions: AlertAction[];
  metadata?: any;
}

export interface AlertAction {
  id: string;
  label: string;
  action: string;
  parameters?: any;
  destructive?: boolean;
}
