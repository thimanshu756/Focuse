/**
 * Device routes
 */

import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { rateLimiters } from '../middleware/rate-limiter.middleware';
import { registerDeviceSchema, updateDeviceSchema, deleteDeviceSchema } from '../validators/device.validator';

const router = Router();
const controller = new DeviceController();

// All device routes require authentication
router.use(authenticate);

// Register device (create or update)
router.post('/', rateLimiters.standard, validateRequest(registerDeviceSchema), controller.registerDevice);

// Get all user devices
router.get('/', rateLimiters.standard, controller.getUserDevices);

// Update device
router.patch('/:id', rateLimiters.standard, validateRequest(updateDeviceSchema), controller.updateDevice);

// Delete device
router.delete('/:id', rateLimiters.standard, validateRequest(deleteDeviceSchema), controller.deleteDevice);

export default router;
