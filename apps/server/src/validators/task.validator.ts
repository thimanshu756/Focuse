import { z } from 'zod';

// MongoDB ObjectId validation
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// Task status enum
const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']);

// Task priority enum
const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

// Date validation (must be future for dueDate)
const futureDateSchema = z.string().datetime().refine(
  (date) => new Date(date) > new Date(),
  { message: 'Due date must be in the future' }
);

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
    description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
    dueDate: futureDateSchema.optional(),
    priority: taskPrioritySchema.optional().default('MEDIUM'),
    estimatedMinutes: z
      .number()
      .int('Estimated minutes must be an integer')
      .min(5, 'Estimated minutes must be at least 5')
      .max(480, 'Estimated minutes must be at most 480')
      .optional(),
    parentTaskId: objectIdSchema.optional(),
    tagIds: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: z.string().datetime().optional().nullable(),
    estimatedMinutes: z
      .number()
      .int()
      .min(5)
      .max(480)
      .optional()
      .nullable(),
    tagIds: z.array(z.string()).max(10).optional(),
  }),
});

export const listTasksSchema = z.object({
  query: z.object({
    // Accept string or array of strings (Express query params format)
    status: z
      .union([
        taskStatusSchema,
        z.array(taskStatusSchema),
        z.string().refine(
          (val) => ['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'].includes(val),
          { message: 'Invalid status value' }
        ),
        z.array(z.string()).refine(
          (arr) => arr.every((val) => ['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'].includes(val)),
          { message: 'Invalid status value in array' }
        ),
      ])
      .optional(),
    priority: taskPrioritySchema.optional(),
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

export const taskIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const aiBreakdownSchema = z.object({
  body: z.object({
    prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(500, 'Prompt must be 500 characters or less'),
    deadline: futureDateSchema,
    priority: taskPrioritySchema.optional().default('MEDIUM'),
  }),
});

export const bulkDeleteSchema = z.object({
  body: z.object({
    taskIds: z
      .array(objectIdSchema)
      .min(1, 'At least one task ID is required')
      .max(50, 'Maximum 50 tasks can be deleted at once'),
  }),
});

