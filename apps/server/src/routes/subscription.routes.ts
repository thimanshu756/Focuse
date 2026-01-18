import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { rateLimiters } from '../middleware/rate-limiter.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { 
  listPlansSchema, 
  createSubscriptionSchema, 
  verifyPaymentSchema,
  getCurrentSubscriptionSchema,
  cancelSubscriptionSchema,
  resumeSubscriptionSchema
} from '../validators/subscription.validator.js';

const router: Router = Router();
const controller = new SubscriptionController();

// GET /api/v1/subscription/plans - List available plans
// Public endpoint (optional auth - if authenticated, shows current plan)
router.get(
  '/plans',
  optionalAuthenticate, // Optional auth - doesn't require token
  rateLimiters.standard,
  validateRequest(listPlansSchema),
  controller.getPlans
);

// POST /api/v1/subscription/create - Create subscription
// Requires authentication
// Rate limited to prevent spam and abuse
router.post(
  '/create',
  authenticate, // Required authentication
  rateLimiters.subscriptionCreate, // Strict rate limiting
  validateRequest(createSubscriptionSchema),
  controller.createSubscription
);

// POST /api/v1/subscription/verify - Verify payment after Razorpay
// CRITICAL endpoint - verifies payment signature and activates subscription
// Requires authentication
router.post(
  '/verify',
  authenticate, // Required authentication
  rateLimiters.paymentVerify, // Rate limit to prevent abuse
  validateRequest(verifyPaymentSchema),
  controller.verifyPayment
);

// GET /api/v1/subscription/current - Get user's current subscription
// Returns comprehensive subscription status with expiration checks
// Requires authentication
// Optional query param: ?sync=true to sync with Razorpay
router.get(
  '/current',
  authenticate, // Required authentication
  rateLimiters.standard, // Standard rate limiting
  validateRequest(getCurrentSubscriptionSchema),
  controller.getCurrentSubscription
);

// POST /api/v1/subscription/cancel - Cancel user's subscription
// Supports immediate cancellation or cancel at period end (default)
// Requires authentication
router.post(
  '/cancel',
  authenticate, // Required authentication
  rateLimiters.subscriptionCancel, // Rate limit to prevent abuse
  validateRequest(cancelSubscriptionSchema),
  controller.cancelSubscription
);

// POST /api/v1/subscription/resume - Resume cancelled subscription
// Only works for subscriptions cancelled with cancelAtPeriodEnd = true
// Requires authentication
router.post(
  '/resume',
  authenticate, // Required authentication
  rateLimiters.subscriptionResume, // Rate limit to prevent abuse
  validateRequest(resumeSubscriptionSchema),
  controller.resumeSubscription
);

export default router;
