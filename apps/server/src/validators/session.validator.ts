import { z } from 'zod';

// MongoDB ObjectId validation
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// Session status enum
const sessionStatusSchema = z.enum(['RUNNING', 'PAUSED', 'COMPLETED', 'FAILED']);

// Session fail reason enum
const failReasonSchema = z.enum([
  'USER_GAVE_UP',
  'APP_BACKGROUNDED',
  'APP_CRASHED',
  'DISTRACTION_OPENED',
  'TIMEOUT',
]);

// Platform enum
const platformSchema = z.enum(['web', 'ios', 'android']);

export const createSessionSchema = z.object({
  body: z.object({
    taskId: objectIdSchema.optional(),
    duration: z.number().int().min(5, 'Duration must be at least 5 minutes').max(240, 'Duration must be at most 240 minutes'),
    platform: platformSchema.optional(),
    deviceId: z.string().max(100).optional(),
  }),
});

export const sessionIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const pauseSessionSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const resumeSessionSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const completeSessionSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    actualDuration: z
      .number()
      .int()
      .min(1, 'Actual duration must be at least 1 second')
      .optional(),
  }),
});

export const failSessionSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    reason: failReasonSchema,
  }),
});

export const listSessionsSchema = z.object({
  query: z.object({
    status: sessionStatusSchema.optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    taskId: objectIdSchema.optional(),
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().int().min(1))
      .optional()
      .default('1'),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().int().min(1).max(100))
      .optional()
      .default('20'),
  }),
});

export const statsQuerySchema = z.object({
  query: z.object({
    period: z.enum(['today', 'week', 'month', 'year', 'all']).optional().default('week'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export const bulkCompleteSchema = z.object({
  body: z.object({
    sessionIds: z
      .array(objectIdSchema)
      .min(1, 'At least one session ID is required')
      .max(100, 'Maximum 100 sessions can be completed at once'),
  }),
});

export const forestSessionsSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().int().min(1).max(100))
      .optional()
      .default('50'),
  }),
});

