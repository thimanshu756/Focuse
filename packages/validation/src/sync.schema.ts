/**
 * Sync validation schemas
 * @package @forest/validation
 */

import { z } from 'zod';

const syncOperationEnum = z.enum(['CREATE', 'UPDATE', 'DELETE']);

// Generic sync operation item
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
  deviceId: z.string().min(1, 'Device ID is required'),
  lastSyncedAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  operations: z
    .array(syncOperationItemSchema)
    .max(100, 'Maximum 100 operations per sync'),
});

export const syncSessionsSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  lastSyncedAt: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  operations: z
    .array(syncOperationItemSchema)
    .max(100, 'Maximum 100 operations per sync'),
});

// Type exports
export type SyncTasksForm = z.infer<typeof syncTasksSchema>;
export type SyncSessionsForm = z.infer<typeof syncSessionsSchema>;
export type SyncOperationItem = z.infer<typeof syncOperationItemSchema>;
