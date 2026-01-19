import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { SubscriptionService } from '../services/subscription.service.js';
import { 
  CreateSubscriptionInput, 
  VerifyPaymentInput,
  CancelSubscriptionInput
} from '../types/subscription.types.js';

export class SubscriptionController {
  private subscriptionService = new SubscriptionService();

  /**
   * GET /api/v1/subscription/plans
   * List all available subscription plans
   * Public endpoint (optional auth - shows current plan if authenticated)
   */
  getPlans = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Optional: if user is authenticated, pass userId to show current plan
      const userId = req.user?.id;

      const result = await this.subscriptionService.getAvailablePlans(userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/subscription/create
   * Create a new subscription for the authenticated user
   * Requires authentication
   */
  createSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      const data: CreateSubscriptionInput = req.body;

      const result = await this.subscriptionService.createSubscription(
        req.user.id,
        req.user.email,
        data
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'Subscription created successfully. Complete payment to activate.',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/subscription/verify
   * Verify payment after Razorpay checkout
   * CRITICAL: Handles payment signature verification and subscription activation
   * Requires authentication
   */
  verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      const data: VerifyPaymentInput = req.body;

      const result = await this.subscriptionService.verifyPayment(
        req.user.id,
        data
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Payment verified successfully. Your PRO subscription is now active!',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/subscription/current
   * Get user's current subscription status
   * Handles expiration detection and optional Razorpay sync
   * Requires authentication
   */
  getCurrentSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      // Optional query param to sync with Razorpay
      const syncWithRazorpay = req.query.sync === 'true';

      const result = await this.subscriptionService.getCurrentSubscription(
        req.user.id,
        syncWithRazorpay
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/subscription/cancel
   * Cancel user's active subscription
   * Supports both immediate cancellation and cancel at period end
   * Requires authentication
   */
  cancelSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      const data: CancelSubscriptionInput = req.body;

      const result = await this.subscriptionService.cancelSubscription(
        req.user.id,
        data
      );

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/subscription/resume
   * Resume a cancelled subscription
   * Only works for subscriptions cancelled with cancelAtPeriodEnd = true
   * Requires authentication
   */
  resumeSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      const result = await this.subscriptionService.resumeSubscription(
        req.user.id
      );

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}
