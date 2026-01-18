import { Router } from 'express';
import express from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';
import { rateLimiters } from '../middleware/rate-limiter.middleware.js';

const router: Router = Router();
const controller = new WebhookController();

// POST /api/v1/webhooks/razorpay - Razorpay webhook handler
// CRITICAL: NO AUTHENTICATION (webhooks come from Razorpay)
// Uses signature verification for security
// Uses express.raw() to capture raw body for signature verification
router.post(
  '/razorpay',
  express.raw({ type: 'application/json' }), // Capture raw body for signature verification
  rateLimiters.webhook, // Special rate limiter for webhooks
  (req, res, next) => {
    // Convert raw body to string and store it
    // @ts-ignore - Add rawBody property
    req.rawBody = req.body.toString('utf8');
    
    // Parse JSON for easier access
    try {
      req.body = JSON.parse(req.rawBody);
    } catch (error) {
      // If parsing fails, let the controller handle it
    }
    
    next();
  },
  controller.handleRazorpayWebhook
);

export default router;
