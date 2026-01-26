/**
 * Session validation schemas
 * @package @forest/validation
 */

import { z } from 'zod';

const sessionStatusEnum = z.enum(['RUNNING', 'PAUSED', 'COMPLETED', 'FAILED']);
const sessionFailReasonEnum = z.enum([
  'USER_GAVE_UP',
  'APP_BACKGROUNDED',
  'APP_CRASHED',
  'DISTRACTION_OPENED',
  'TIMEOUT',
]);

export const createSessionSchema = z.object({
  taskId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format')
    .optional(),
  duration: z
    .number()
    .int()
    .min(60, 'Minimum duration is 60 seconds')
    .max(7200, 'Maximum duration is 2 hours'),
  platform: z.enum(['web', 'ios', 'android']).optional(),
  deviceId: z.string().optional(),
});

export const updateSessionSchema = z.object({
  status: sessionStatusEnum.optional(),
  progress: z.number().int().min(0).max(100).optional(),
  timeElapsed: z.number().int().min(0).optional(),
  pauseDuration: z.number().int().min(0).optional(),
  reason: sessionFailReasonEnum.optional(),
  actualDuration: z.number().int().min(0).optional(),
  breakTaken: z.boolean().optional(),
});

export const sessionListFiltersSchema = z.object({
  status: sessionStatusEnum.optional(),
  taskId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  startDate: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1).default(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100).default(20)),
});

export const sessionIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid session ID format'),
});

// Type exports
export type CreateSessionForm = z.infer<typeof createSessionSchema>;
export type UpdateSessionForm = z.infer<typeof updateSessionSchema>;
export type SessionListFilters = z.infer<typeof sessionListFiltersSchema>;
export type SessionIdParam = z.infer<typeof sessionIdSchema>;
