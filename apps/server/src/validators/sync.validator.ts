import { z } from 'zod';

// Entity enum
const entitySchema = z.enum(['sessions', 'tasks', 'user']);

export const syncSchema = z.object({
  body: z.object({
    lastSyncTime: z.string().datetime().nullable().optional(),
    entities: z.array(entitySchema).optional().default(['sessions', 'tasks', 'user']),
  }),
});

