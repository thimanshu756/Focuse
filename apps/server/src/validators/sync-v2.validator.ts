/**
 * Bidirectional sync validation schemas (for mobile)
 */

import { z } from 'zod';

const syncOperationEnum = z.enum(['CREATE', 'UPDATE', 'DELETE']);

const syncOperationItemSchema = z.object({
  id: z.string().min(1, 'Operation ID is required'),
  operation: syncOperationEnum,
  data: z.record(z.any()).optional(),
  timestamp: z
    .string()
    .datetime()
    .or(z.date())
    .transform((val) => new Date(val)),
});

export const syncTasksSchema = z.object({
  body: z.object({
    deviceId: z.string().min(1, 'Device ID is required'),
    lastSyncedAt: z
      .string()
      .datetime()
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),
    operations: z.array(syncOperationItemSchema).max(100, 'Maximum 100 operations per sync'),
  }),
});

export const syncSessionsSchema = z.object({
  body: z.object({
    deviceId: z.string().min(1, 'Device ID is required'),
    lastSyncedAt: z
      .string()
      .datetime()
      .optional()
      .nullable()
      .transform((val) => (val ? new Date(val) : null)),
    operations: z.array(syncOperationItemSchema).max(100, 'Maximum 100 operations per sync'),
  }),
});
