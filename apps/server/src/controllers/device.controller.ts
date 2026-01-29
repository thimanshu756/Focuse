/**
 * Device controller - HTTP handling for device endpoints
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware';
import { DeviceService } from '../services/device.service';

const deviceService = new DeviceService();

export class DeviceController {
  /**
   * Register a new device
   * POST /api/devices
   */
  registerDevice = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const device = await deviceService.registerDevice(userId, req.body);

      res.status(201).json({
        success: true,
        data: {
          id: device.id,
          registered: true,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update device information
   * PATCH /api/devices/:id
   */
  updateDevice = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const device = await deviceService.updateDevice(userId, id, req.body);

      res.json({
        success: true,
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a device
   * DELETE /api/devices/:id
   */
  deleteDevice = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await deviceService.deleteDevice(userId, id);

      res.json({
        success: true,
        data: { deleted: true },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all user devices
   * GET /api/devices
   */
  getUserDevices = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const devices = await deviceService.getUserDevices(userId);

      res.json({
        success: true,
        data: { devices },
      });
    } catch (error) {
      next(error);
    }
  };
}
