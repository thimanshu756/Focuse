/**
 * Task validation schemas
 * @package @forest/validation
 */

import { z } from 'zod';

const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']);
const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  priority: taskPriorityEnum.optional().default('MEDIUM'),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  estimatedMinutes: z
    .number()
    .int()
    .min(1, 'Must be at least 1 minute')
    .max(1440, 'Cannot exceed 24 hours')
    .optional(),
  tagIds: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  scheduledStartTime: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  scheduledEndTime: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description too long')
    .optional()
    .nullable(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  dueDate: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : val)),
  estimatedMinutes: z.number().int().min(1).max(1440).optional().nullable(),
  tagIds: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  scheduledStartTime: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : val)),
  scheduledEndTime: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : val)),
});

export const taskListFiltersSchema = z.object({
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
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

export const taskIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format'),
});

// Type exports
export type CreateTaskForm = z.infer<typeof createTaskSchema>;
export type UpdateTaskForm = z.infer<typeof updateTaskSchema>;
export type TaskListFilters = z.infer<typeof taskListFiltersSchema>;
export type TaskIdParam = z.infer<typeof taskIdSchema>;
