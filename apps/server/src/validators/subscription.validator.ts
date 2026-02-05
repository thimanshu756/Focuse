import { z } from 'zod';

// GET /api/v1/subscription/plans - No query params needed, but we can validate if needed
export const listPlansSchema = z.object({
  query: z.object({}).optional(), // No query params for now, but structure is ready
});

// POST /api/v1/subscription/create - Create subscription
export const createSubscriptionSchema = z.object({
  body: z.object({
    planId: z
      .string()
      .min(1, 'Plan ID is required')
      .regex(
        /^pro_(monthly|yearly)$/,
        'Invalid plan ID. Must be "pro_monthly" or "pro_yearly"'
      ),
    source: z
      .enum(['web', 'mobile'])
      .optional()
      .default('web'), // Default to web for backwards compatibility
  }),
});

// POST /api/v1/subscription/verify - Verify payment
export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpayPaymentId: z
      .string()
      .min(1, 'Razorpay payment ID is required')
      .regex(/^pay_[a-zA-Z0-9]+$/, 'Invalid Razorpay payment ID format'),
    razorpaySubscriptionId: z
      .string()
      .min(1, 'Razorpay subscription ID is required')
      .regex(/^sub_[a-zA-Z0-9]+$/, 'Invalid Razorpay subscription ID format'),
    razorpaySignature: z
      .string()
      .optional() // Optional for subscription payments (Razorpay might not provide it)
      .refine(
        (val) => !val || val.length >= 64,
        'Invalid signature length (must be at least 64 characters if provided)'
      ),
  }),
});

// GET /api/v1/subscription/current - Get current subscription
export const getCurrentSubscriptionSchema = z.object({
  query: z.object({
    sync: z
      .enum(['true', 'false'])
      .optional()
      .transform((val) => val === 'true'),
  }).optional(),
});

// POST /api/v1/subscription/cancel - Cancel subscription
export const cancelSubscriptionSchema = z.object({
  body: z.object({
    cancelAtPeriodEnd: z
      .boolean()
      .optional()
      .default(true), // Default: cancel at period end (user keeps access)
    reason: z
      .string()
      .max(500, 'Reason must be less than 500 characters')
      .optional(),
  }),
});

// POST /api/v1/subscription/resume - Resume cancelled subscription
export const resumeSubscriptionSchema = z.object({
  body: z.object({}).optional(), // No body parameters required
});
