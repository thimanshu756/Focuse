/**
 * Insights Validators
 * Zod schemas for validating insights API requests
 */

import { z } from 'zod';

/**
 * Generate weekly insights request
 */
export const generateWeeklyInsightsSchema = z.object({
  body: z.object({
    weekStart: z
      .string()
      .datetime()
      .optional()
      .describe('ISO date string for week start (Monday). Defaults to last Monday if not provided.'),
    forceRegenerate: z
      .boolean()
      .optional()
      .default(false)
      .describe('Force regenerate insights even if cached'),
  }).optional().default({}),
});

/**
 * Get weekly insight by ID
 */
export const getInsightByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid insight ID format')
      .describe('MongoDB ObjectId'),
  }),
});

/**
 * List weekly insights
 */
export const listInsightsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().int().min(1))
      .describe('Page number for pagination'),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .pipe(z.number().int().min(1).max(50))
      .describe('Number of insights per page (max 50)'),
    startDate: z
      .string()
      .datetime()
      .optional()
      .describe('Filter insights from this date onwards'),
    endDate: z
      .string()
      .datetime()
      .optional()
      .describe('Filter insights up to this date'),
  }).optional().default({}),
});

/**
 * Mark insight as read
 */
export const markInsightAsReadSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid insight ID format')
      .describe('MongoDB ObjectId'),
  }),
});

/**
 * Delete insight
 */
export const deleteInsightSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid insight ID format')
      .describe('MongoDB ObjectId'),
  }),
});
