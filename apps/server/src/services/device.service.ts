/**
 * Device service - Business logic for device management
 */

import { PrismaClient } from '@prisma/client';
import type { RegisterDeviceInput, UpdateDeviceInput, DeviceResponse } from '../types/device.types';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class DeviceService {
  /**
   * Register or update a device
   * Uses upsert to handle both new and existing devices
   */
  async registerDevice(userId: string, data: RegisterDeviceInput): Promise<DeviceResponse> {
    try {
      // Validate platform
      if (!['web', 'ios', 'android'].includes(data.platform)) {
        throw new AppError('Invalid platform. Must be web, ios, or android', 400, 'INVALID_PLATFORM');
      }

      // Check if user exists and is not deleted
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          deletedAt: null,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Upsert device (create or update if deviceId already exists)
      const device = await prisma.device.upsert({
        where: {
          deviceId: data.deviceId,
        },
        update: {
          platform: data.platform,
          osVersion: data.osVersion,
          appVersion: data.appVersion,
          pushToken: data.pushToken,
          lastSeenAt: new Date(),
          userId, // Ensure ownership is maintained
        },
        create: {
          deviceId: data.deviceId,
          platform: data.platform,
          osVersion: data.osVersion,
          appVersion: data.appVersion,
          pushToken: data.pushToken,
          userId,
        },
      });

      logger.info('Device registered', {
        userId,
        deviceId: device.id,
        platform: data.platform,
      });

      return device;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Device registration failed', { error: (error as Error).message, userId });
      throw new AppError('Failed to register device', 500, 'DEVICE_REGISTRATION_FAILED');
    }
  }

  /**
   * Update device information (push token, OS version, etc.)
   */
  async updateDevice(userId: string, deviceId: string, data: UpdateDeviceInput): Promise<DeviceResponse> {
    try {
      // Find device and verify ownership
      const existingDevice = await prisma.device.findFirst({
        where: {
          id: deviceId,
          userId, // CRITICAL: Ensure user owns this device
        },
      });

      if (!existingDevice) {
        throw new AppError('Device not found or access denied', 404, 'DEVICE_NOT_FOUND');
      }

      // Update device
      const device = await prisma.device.update({
        where: {
          id: deviceId,
        },
        data: {
          ...data,
          lastSeenAt: new Date(),
        },
      });

      logger.info('Device updated', { userId, deviceId });

      return device;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Device update failed', { error: (error as Error).message, userId, deviceId });
      throw new AppError('Failed to update device', 500, 'DEVICE_UPDATE_FAILED');
    }
  }

  /**
   * Delete a device
   */
  async deleteDevice(userId: string, deviceId: string): Promise<void> {
    try {
      // Find device and verify ownership
      const existingDevice = await prisma.device.findFirst({
        where: {
          id: deviceId,
          userId,
        },
      });

      if (!existingDevice) {
        throw new AppError('Device not found or access denied', 404, 'DEVICE_NOT_FOUND');
      }

      // Delete device
      await prisma.device.delete({
        where: {
          id: deviceId,
        },
      });

      logger.info('Device deleted', { userId, deviceId });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Device deletion failed', { error: (error as Error).message, userId, deviceId });
      throw new AppError('Failed to delete device', 500, 'DEVICE_DELETE_FAILED');
    }
  }

  /**
   * Get all devices for a user
   */
  async getUserDevices(userId: string): Promise<DeviceResponse[]> {
    try {
      const devices = await prisma.device.findMany({
        where: {
          userId,
        },
        orderBy: {
          lastSeenAt: 'desc',
        },
      });

      return devices;
    } catch (error) {
      logger.error('Failed to fetch user devices', { error: (error as Error).message, userId });
      throw new AppError('Failed to fetch devices', 500, 'DEVICE_FETCH_FAILED');
    }
  }

  /**
   * Update last seen timestamp for a device
   */
  async updateLastSeen(userId: string, deviceId: string): Promise<void> {
    try {
      await prisma.device.updateMany({
        where: {
          deviceId,
          userId,
        },
        data: {
          lastSeenAt: new Date(),
        },
      });
    } catch (error) {
      // Non-critical, just log
      logger.warn('Failed to update device last seen', { userId, deviceId });
    }
  }
}
