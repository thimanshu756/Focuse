/**
 * Device validation schemas
 * @package @forest/validation
 */

import { z } from 'zod';

const platformEnum = z.enum(['web', 'ios', 'android']);

export const registerDeviceSchema = z.object({
  deviceId: z
    .string()
    .min(1, 'Device ID is required')
    .max(255, 'Device ID too long'),
  platform: platformEnum,
  osVersion: z.string().max(50, 'OS version too long').optional(),
  appVersion: z
    .string()
    .min(1, 'App version is required')
    .max(50, 'App version too long'),
  pushToken: z.string().max(500, 'Push token too long').optional(),
});

export const updateDeviceSchema = z.object({
  pushToken: z.string().max(500, 'Push token too long').optional(),
  osVersion: z.string().max(50, 'OS version too long').optional(),
  appVersion: z.string().max(50, 'App version too long').optional(),
});

export const deviceIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid device ID format'),
});

// Type exports
export type RegisterDeviceForm = z.infer<typeof registerDeviceSchema>;
export type UpdateDeviceForm = z.infer<typeof updateDeviceSchema>;
export type DeviceIdParam = z.infer<typeof deviceIdSchema>;
