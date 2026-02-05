/**
 * Device types for mobile sync and push notifications
 */

export interface RegisterDeviceInput {
  deviceId: string;
  platform: 'web' | 'ios' | 'android';
  osVersion?: string;
  appVersion: string;
  pushToken?: string;
}

export interface UpdateDeviceInput {
  pushToken?: string;
  osVersion?: string;
  appVersion?: string;
}

export interface DeviceResponse {
  id: string;
  deviceId: string;
  platform: string;
  osVersion?: string | null;
  appVersion: string;
  pushToken?: string | null;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
