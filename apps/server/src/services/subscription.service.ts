import { prisma } from '../lib/prisma.js';
import { razorpay } from '../lib/razorpay.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import { verifyPaymentSignature } from '../utils/razorpay-signature.js';
import {
  PlanResponse,
  PlansListResponse,
  CreateSubscriptionInput,
  CreateSubscriptionResponse,
  VerifyPaymentInput,
  VerifyPaymentResponse,
  CurrentSubscriptionResponse,
  CancelSubscriptionInput,
  CancelSubscriptionResponse,
  ResumeSubscriptionResponse,
} from '../types/subscription.types.js';
import pkg from '@prisma/client';
const { SubscriptionTier, SubscriptionStatus } = pkg;
import type {
  SubscriptionTier as SubscriptionTierType,
  SubscriptionStatus as SubscriptionStatusType,
} from '@prisma/client';

// Type-safe Prisma model access (until Prisma client is regenerated)
const prismaModels = {
  planConfiguration: (prisma as any).planConfiguration,
  subscription: (prisma as any).subscription,
  payment: (prisma as any).payment,
  subscriptionAuditLog: (prisma as any).subscriptionAuditLog,
};

export class SubscriptionService {
  /**
   * Get all available subscription plans
   * If userId is provided, also returns current user's subscription info
   */
  async getAvailablePlans(userId?: string): Promise<PlansListResponse> {
    try {
      // Fetch all active plans, ordered by displayOrder (yearly first, then monthly)
      const plans = await prismaModels.planConfiguration.findMany({
        where: {
          isActive: true,
          // Check if plan is available (within date range if specified)

        },
        orderBy: [
          { displayOrder: 'asc' }, // Popular plans first
          { createdAt: 'asc' },
        ],
      });

      if (plans.length === 0) {
        logger.warn('No active plans found in database');
        throw new AppError('No subscription plans available', 404, 'NO_PLANS_AVAILABLE');
      }

      // Format plans for response
      const formattedPlans: PlanResponse[] = plans.map((plan: any) => {
        const amountInRupees = plan.amount / 100;
        const displayAmount = `₹${amountInRupees}`;

        return {
          id: plan.id,
          planId: plan.planId,
          name: plan.name,
          description: plan.description,
          tier: plan.tier,
          billingPeriod: plan.billingPeriod,
          amount: plan.amount,
          currency: plan.currency,
          displayAmount,
          features: plan.features as { features: string[] },
          aiRequestsLimit: plan.aiRequestsLimit,
          maxDevices: plan.maxDevices,
          exportEnabled: plan.exportEnabled,
          prioritySupport: plan.prioritySupport,
          isPopular: plan.isPopular,
          savingsPercentage: plan.savingsPercentage,
          ...(plan.metadata && typeof plan.metadata === 'object' && 'savingsAmount' in plan.metadata
            ? { savingsAmount: (plan.metadata as any).savingsAmount }
            : {}),
          ...(plan.metadata && typeof plan.metadata === 'object' && 'monthlyEquivalent' in plan.metadata
            ? { monthlyEquivalent: (plan.metadata as any).monthlyEquivalent }
            : {}),
        };
      });

      // If user is authenticated, get their current subscription
      let currentPlan: PlansListResponse['currentPlan'] = null;

      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            subscriptionTier: true,
            subscriptionStatus: true,
            subscriptionEndDate: true,
          },
        });

        if (user) {
          // Find active subscription
          const activeSubscription = await prismaModels.subscription.findFirst({
            where: {
              userId,
              status: {
                in: ['ACTIVE', 'TRIAL'] as SubscriptionStatusType[],
              },
            },
            orderBy: { createdAt: 'desc' },
            select: {
              planType: true,
              currentPeriodEnd: true,
            },
          });

          if (activeSubscription) {
            // Find the planId for this subscription
            const userPlan = plans.find(
              (p: any) => p.billingPeriod === activeSubscription.planType
            );

            currentPlan = {
              planId: userPlan?.planId || null,
              status: user.subscriptionStatus,
              expiresAt: activeSubscription.currentPeriodEnd,
            };
          } else if ((user.subscriptionTier as any) === 'PRO' && (user.subscriptionStatus as any) === 'ACTIVE') {
            // Fallback: user has PRO tier but no subscription record (legacy data)
            // Try to infer from subscriptionEndDate
            currentPlan = {
              planId: null, // Unknown plan
              status: user.subscriptionStatus,
              expiresAt: user.subscriptionEndDate,
            };
          }
        }
      }

      logger.info('Plans fetched', {
        plansCount: formattedPlans.length,
        userId: userId || 'anonymous',
        hasCurrentPlan: currentPlan !== null,
      });

      return {
        plans: formattedPlans,
        currentPlan,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error('Error fetching plans', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: userId || 'anonymous',
      });

      throw new AppError(
        'Failed to fetch subscription plans',
        500,
        'PLANS_FETCH_ERROR',
        error instanceof Error ? error.message : undefined
      );
    }
  }

  /**
   * Create a new subscription for a user
   * Handles all edge cases and ensures data consistency
   */
  async createSubscription(
    userId: string,
    userEmail: string,
    data: CreateSubscriptionInput,
    userAgent?: string,
    ipAddress?: string
  ): Promise<CreateSubscriptionResponse> {
    const { planId, source = 'web' } = data;

    logger.info('Creating subscription', { userId, planId });

    try {
      // STEP 1: Validate subscriptions are enabled
      if (!env.ENABLE_SUBSCRIPTIONS) {
        throw new AppError(
          'Subscriptions are currently disabled',
          503,
          'SUBSCRIPTIONS_DISABLED'
        );
      }

      // STEP 2: Fetch the plan from database
      const plan = await prismaModels.planConfiguration.findUnique({
        where: { planId },
      });

      if (!plan) {
        logger.warn('Plan not found', { userId, planId });
        throw new AppError('Invalid plan selected', 404, 'PLAN_NOT_FOUND');
      }

      // STEP 3: Validate plan is active and available
      if (!plan.isActive) {
        logger.warn('Inactive plan selected', { userId, planId });
        throw new AppError('This plan is no longer available', 400, 'PLAN_INACTIVE');
      }

      // Check plan availability dates
      const now = new Date();
      if (plan.availableUntil && plan.availableUntil < now) {
        logger.warn('Expired plan selected', { userId, planId });
        throw new AppError('This plan is no longer available', 400, 'PLAN_EXPIRED');
      }

      // STEP 4: Check if user already has an active subscription
      const existingActiveSubscription = await (prisma as any).subscription.findFirst({
        where: {
          userId,
          status: {
            in: ['ACTIVE', 'TRIAL'] as SubscriptionStatusType[],
          },
        },
      });

      if (existingActiveSubscription) {
        logger.warn('User already has active subscription', {
          userId,
          existingSubscriptionId: existingActiveSubscription.id,
        });
        throw new AppError(
          'You already have an active subscription. Please cancel it first.',
          400,
          'ACTIVE_SUBSCRIPTION_EXISTS'
        );
      }

      // STEP 5: Check for pending subscriptions (created but not paid in last 30 minutes)
      // const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      const timeoutMinutes = env.NODE_ENV === 'development' ? 5 : 30;
      const timeoutAgo = new Date(Date.now() - timeoutMinutes * 60 * 1000);
      const pendingSubscription = await prismaModels.subscription.findFirst({
        where: {
          userId,
          status: 'INACTIVE' as SubscriptionStatusType,
          createdAt: { gte: timeoutAgo },
        },
      });

      if (pendingSubscription) {
        logger.warn('User has pending subscription', {
          userId,
          pendingSubscriptionId: pendingSubscription.id,
        });
        // delete the pending subscription
        await prismaModels.subscription.delete({
          where: { id: pendingSubscription.id },
        });
        logger.info('Deleted pending subscription', {
          userId,
          pendingSubscriptionId: pendingSubscription.id,
        });

      }

      // STEP 6: Get or create Razorpay customer ID
      let razorpayCustomerId: string;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Check if user already has a Razorpay customer ID
      const userWithCustomer = await prisma.user.findUnique({
        where: { id: userId },
        select: { razorpayCustomerId: true } as any,
      });

      if (userWithCustomer && (userWithCustomer as any).razorpayCustomerId) {
        razorpayCustomerId = (userWithCustomer as any).razorpayCustomerId;
        logger.info('Using existing Razorpay customer', { userId, razorpayCustomerId });
      } else {
        // Create new Razorpay customer
        try {
          const customer = await razorpay.customers.create({
            name: user.name,
            email: user.email,
            fail_existing: 0, // Don't fail if customer with email exists
          }) as any;

          razorpayCustomerId = customer.id;

          // Update user with Razorpay customer ID
          await prisma.user.update({
            where: { id: userId },
            data: { razorpayCustomerId: razorpayCustomerId } as any,
          });

          logger.info('Created new Razorpay customer', { userId, razorpayCustomerId });
        } catch (error) {
          logger.error('Failed to create Razorpay customer', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          throw new AppError(
            'Failed to create customer profile',
            500,
            'CUSTOMER_CREATION_FAILED',
            error instanceof Error ? error.message : undefined
          );
        }
      }

      // STEP 7: Validate Razorpay plan ID is configured
      if (!plan.razorpayPlanId) {
        logger.error('Plan missing Razorpay plan ID', { planId });
        throw new AppError(
          'Plan configuration error. Please contact support.',
          500,
          'RAZORPAY_PLAN_NOT_CONFIGURED'
        );
      }

      // STEP 8: Create subscription in our database first (with INACTIVE status)
      // This allows us to rollback if Razorpay fails
      let dbSubscription;
      try {
        dbSubscription = await prismaModels.subscription.create({
          data: {
            userId,
            razorpayCustomerId,
            razorpayPlanId: plan.razorpayPlanId,
            razorpaySubscriptionId: '', // Will be updated after Razorpay creation
            planType: plan.billingPeriod,
            planAmount: plan.amount,
            currency: plan.currency,
            billingCycle: plan.billingPeriod === 'MONTHLY' ? 1 : 12,
            currentPeriodStart: new Date(), // Temporary, will be updated by webhook
            currentPeriodEnd: new Date(), // Temporary, will be updated by webhook
            status: 'INACTIVE' as SubscriptionStatusType,
            autoRenew: true,
            metadata: {
              planId: plan.planId,
              planName: plan.name,
              createdVia: 'API',
              source, // 'web' or 'mobile' - for analytics and App Store compliance
              userAgent: userAgent || 'unknown',
              ipAddress: ipAddress || 'unknown',
              createdAt: new Date().toISOString(),
            },
          },
        });

        logger.info('Created subscription in database', {
          userId,
          subscriptionId: dbSubscription.id,
        });
      } catch (error) {
        logger.error('Failed to create subscription in database', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new AppError(
          'Failed to create subscription',
          500,
          'DATABASE_ERROR',
          error instanceof Error ? error.message : undefined
        );
      }

      // STEP 9: Create subscription in Razorpay
      let razorpaySubscription: any;
      try {
        logger.info('Creating subscription in (before) Razorpay', {
          userId,
          subscriptionId: dbSubscription.id,
        });
        // Razorpay subscription create parameters
        const subscriptionParams: any = {
          plan_id: plan.razorpayPlanId,
          customer_notify: 0, // We'll handle notifications
          total_count: plan.billingPeriod === 'MONTHLY' ? 12 : 1, // 12 months for monthly, 1 for yearly
          quantity: 1,
          start_at: Math.floor(Date.now() / 1000) + 60, // Start after 1 minute
          expire_by: Math.floor(Date.now() / 1000) + env.PAYMENT_TIMEOUT_SECONDS, // Expire link after timeout
          notes: {
            userId,
            planId: plan.planId,
            subscriptionId: dbSubscription.id,
          },
        };

        // Add customer_id if available (some Razorpay SDK versions require it)
        if (razorpayCustomerId) {
          subscriptionParams.customer_id = razorpayCustomerId;
        }

        razorpaySubscription = await razorpay.subscriptions.create(subscriptionParams) as any;

        logger.info('Created subscription in Razorpay', {
          userId,
          razorpaySubscriptionId: razorpaySubscription?.id,
        });
      } catch (error) {
        logger.error('Failed to create Razorpay subscription', {
          userId,
          subscriptionId: dbSubscription.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        // Rollback: Delete database subscription if Razorpay fails
        logger.error('Failed to create Razorpay subscription, rolling back', {
          userId,
          dbSubscriptionId: dbSubscription.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        try {
          await prismaModels.subscription.delete({
            where: { id: dbSubscription.id },
          });
          logger.info('Rolled back database subscription', {
            dbSubscriptionId: dbSubscription.id,
          });
        } catch (rollbackError) {
          logger.error('Failed to rollback database subscription', {
            dbSubscriptionId: dbSubscription.id,
            error: rollbackError instanceof Error ? rollbackError.message : 'Unknown error',
          });
        }

        logger.error('Failed to create subscription', {
          userId,
          dbSubscriptionId: dbSubscription.id,
          error: error,
        });
        throw new AppError(
          'Failed to create subscription. Please try again.',
          500,
          'RAZORPAY_SUBSCRIPTION_FAILED',
          error instanceof Error ? error.message : undefined
        );
      }

      // STEP 10: Update database subscription with Razorpay subscription ID
      try {
        dbSubscription = await prismaModels.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            razorpaySubscriptionId: razorpaySubscription.id,
            currentPeriodStart: new Date(razorpaySubscription.start_at * 1000),
            currentPeriodEnd: new Date(razorpaySubscription.current_end * 1000),
            nextBillingDate: new Date(razorpaySubscription.current_end * 1000),
          },
        });

        logger.info('Updated subscription with Razorpay ID', {
          userId,
          subscriptionId: dbSubscription.id,
          razorpaySubscriptionId: razorpaySubscription.id,
        });
      } catch (error) {
        logger.error('Failed to update subscription with Razorpay ID', {
          userId,
          subscriptionId: dbSubscription.id,
          razorpaySubscriptionId: razorpaySubscription.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Don't throw error here - subscription is created in Razorpay
        // Webhook will sync the status later
      }

      // STEP 11: Create audit log
      try {
        await prismaModels.subscriptionAuditLog.create({
          data: {
            userId,
            subscriptionId: dbSubscription.id,
            action: 'CREATED',
            actor: 'USER',
            actorId: userId,
            newState: {
              subscriptionId: dbSubscription.id,
              razorpaySubscriptionId: razorpaySubscription.id,
              planId: plan.planId,
              status: 'INACTIVE',
            },
            reason: 'User initiated subscription creation',
            metadata: {
              planId: plan.planId,
              planName: plan.name,
              amount: plan.amount,
            },
          },
        });
      } catch (error) {
        // Don't fail the request if audit log fails
        logger.error('Failed to create audit log', {
          userId,
          subscriptionId: dbSubscription.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // STEP 12: Prepare checkout options for frontend
      const checkoutOptions: CreateSubscriptionResponse = {
        subscriptionId: dbSubscription.id,
        razorpaySubscriptionId: razorpaySubscription.id,
        planId: plan.planId,
        planName: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        status: 'created',
        checkout: {
          key: env.RAZORPAY_KEY_ID,
          subscription_id: razorpaySubscription.id,
          name: 'Forest - Focus Timer',
          description: `${plan.name} Subscription`,
          amount: plan.amount, // Amount in paise (required for correct display)
          currency: plan.currency, // Currency code
          prefill: {
            email: userEmail,
          },
          theme: {
            color: '#10B981', // Emerald green
          },
          notes: {
            userId,
            planId: plan.planId,
          },
        },
      };

      logger.info('Subscription created successfully', {
        userId,
        subscriptionId: dbSubscription.id,
        razorpaySubscriptionId: razorpaySubscription.id,
        planId: plan.planId,
      });

      return checkoutOptions;
    } catch (error) {
      // Log the error if not already an AppError
      if (!(error instanceof AppError)) {
        logger.error('Unexpected error creating subscription', {
          userId,
          planId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Re-throw AppError as-is, wrap others
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'Failed to create subscription',
        500,
        'SUBSCRIPTION_CREATION_FAILED',
        error instanceof Error ? error.message : undefined
      );
    }
  }

  /**
   * Verify payment after user completes Razorpay checkout
   * CRITICAL: This handles signature verification and activates subscription
   * Includes race condition handling with webhooks
   */
  async verifyPayment(
    userId: string,
    data: VerifyPaymentInput
  ): Promise<VerifyPaymentResponse> {
    const { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature } = data;

    logger.info('Verifying payment', {
      userId,
      razorpayPaymentId,
      razorpaySubscriptionId,
    });

    try {
      // STEP 1: Verify signature if provided (for subscription payments, signature might be missing)
      let signatureVerified = false;

      if (razorpaySignature && razorpaySignature.trim() !== '') {
        const isSignatureValid = verifyPaymentSignature(
          razorpayPaymentId,
          razorpaySubscriptionId,
          razorpaySignature
        );

        if (!isSignatureValid) {
          logger.error('Payment signature verification failed', {
            userId,
            razorpayPaymentId,
            razorpaySubscriptionId,
          });

          // Create audit log for security event
          try {
            await prismaModels.subscriptionAuditLog.create({
              data: {
                userId,
                action: 'PAYMENT_FAILED',
                actor: 'USER',
                actorId: userId,
                reason: 'Invalid payment signature - possible tampering attempt',
                metadata: {
                  razorpayPaymentId,
                  razorpaySubscriptionId,
                  signatureVerificationFailed: true,
                },
              },
            });
          } catch (auditError) {
            logger.error('Failed to create audit log for invalid signature', {
              error: auditError instanceof Error ? auditError.message : 'Unknown error',
            });
          }

          throw new AppError(
            'Payment verification failed. Invalid signature.',
            422,
            'INVALID_SIGNATURE'
          );
        }

        signatureVerified = true;
        logger.info('Payment signature verified successfully', {
          userId,
          razorpayPaymentId,
        });
      } else {
        // For subscription payments, signature might not be provided
        // We'll verify by fetching payment details from Razorpay API
        logger.info('Signature not provided, will verify via Razorpay API', {
          userId,
          razorpayPaymentId,
          razorpaySubscriptionId,
        });
      }

      // STEP 2: Find subscription by Razorpay subscription ID
      const subscription = await prismaModels.subscription.findUnique({
        where: { razorpaySubscriptionId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              subscriptionTier: true,
              subscriptionStatus: true,
            },
          },
        },
      });

      if (!subscription) {
        logger.error('Subscription not found', {
          userId,
          razorpaySubscriptionId,
        });
        throw new AppError(
          'Subscription not found',
          404,
          'SUBSCRIPTION_NOT_FOUND'
        );
      }

      // STEP 3: Verify subscription belongs to the user
      if (subscription.userId !== userId) {
        logger.error('Subscription ownership mismatch', {
          userId,
          subscriptionUserId: subscription.userId,
          razorpaySubscriptionId,
        });
        throw new AppError(
          'Unauthorized: This subscription does not belong to you',
          403,
          'UNAUTHORIZED_SUBSCRIPTION'
        );
      }

      // STEP 4: Check if subscription is already active (idempotency / race condition with webhook)
      if (subscription.status === 'ACTIVE') {
        logger.info('Subscription already active (idempotent request)', {
          userId,
          subscriptionId: subscription.id,
        });

        // Return success response (idempotent)
        return {
          verified: true,
          subscription: {
            id: subscription.id,
            status: subscription.status,
            tier: 'PRO',
            planType: subscription.planType,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            nextBillingDate: subscription.nextBillingDate,
          },
        };
      }

      // STEP 5: Verify payment with Razorpay API
      let razorpayPaymentDetails;
      try {
        razorpayPaymentDetails = await razorpay.payments.fetch(razorpayPaymentId);

        logger.info('Fetched payment details from Razorpay', {
          userId,
          razorpayPaymentId,
          status: razorpayPaymentDetails.status,
          amount: razorpayPaymentDetails.amount,
        });
      } catch (error) {
        logger.error('Failed to fetch payment from Razorpay', {
          userId,
          razorpayPaymentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new AppError(
          'Failed to verify payment with Razorpay',
          500,
          'RAZORPAY_FETCH_FAILED',
          error instanceof Error ? error.message : undefined
        );
      }

      // STEP 6: Validate payment status
      // For subscription payments, the first payment might be an authentication charge (₹5) that gets refunded
      // So we accept: captured, authorized, OR refunded (for authentication charge)
      const validStatuses = ['captured', 'authorized', 'refunded'];
      if (!validStatuses.includes(razorpayPaymentDetails.status)) {
        logger.error('Payment not successful', {
          userId,
          razorpayPaymentId,
          status: razorpayPaymentDetails.status,
        });
        throw new AppError(
          `Payment not successful. Status: ${razorpayPaymentDetails.status}`,
          400,
          'PAYMENT_NOT_SUCCESSFUL'
        );
      }

      // STEP 7: Validate payment amount matches subscription amount
      // Skip amount validation if payment is refunded (authentication charge)
      if (razorpayPaymentDetails.status !== 'refunded' && razorpayPaymentDetails.amount !== subscription.planAmount) {
        logger.error('Payment amount mismatch', {
          userId,
          razorpayPaymentId,
          expectedAmount: subscription.planAmount,
          actualAmount: razorpayPaymentDetails.amount,
        });
        throw new AppError(
          'Payment amount mismatch',
          400,
          'AMOUNT_MISMATCH'
        );
      }

      // Log if this is an authentication charge
      if (razorpayPaymentDetails.status === 'refunded' && razorpayPaymentDetails.amount < subscription.planAmount) {
        logger.info('Authentication charge detected (refunded)', {
          userId,
          razorpayPaymentId,
          amount: razorpayPaymentDetails.amount,
          subscriptionAmount: subscription.planAmount,
        });
      }

      // STEP 8: Fetch subscription details from Razorpay to get accurate dates and validate status
      let razorpaySubscriptionDetails: any = null;
      try {
        razorpaySubscriptionDetails = await razorpay.subscriptions.fetch(razorpaySubscriptionId) as any;

        logger.info('Fetched subscription details from Razorpay', {
          userId,
          razorpaySubscriptionId,
          status: razorpaySubscriptionDetails?.status,
        });

        // Validate subscription status on Razorpay
        // Valid statuses for activation: authenticated (auth charge completed), active (first payment done), created (pending)
        const validSubscriptionStatuses = ['authenticated', 'active', 'created'];
        if (!validSubscriptionStatuses.includes(razorpaySubscriptionDetails?.status)) {
          logger.error('Invalid subscription status on Razorpay', {
            userId,
            razorpaySubscriptionId,
            status: razorpaySubscriptionDetails?.status,
          });
          throw new AppError(
            `Cannot activate subscription. Razorpay subscription status: ${razorpaySubscriptionDetails?.status}`,
            400,
            'INVALID_SUBSCRIPTION_STATUS'
          );
        }
      } catch (error) {
        // If it's our AppError, re-throw it
        if (error instanceof AppError) {
          throw error;
        }

        logger.error('Failed to fetch subscription from Razorpay', {
          userId,
          razorpaySubscriptionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        // Don't fail verification if we can't fetch subscription details due to network/API issues
        // We'll use what we have in the database (signature was already verified)
      }

      // STEP 9: Update subscription and user in a transaction
      let updatedSubscription;
      try {
        updatedSubscription = await prisma.$transaction(async (tx) => {
          // Update subscription status to ACTIVE
          const updated = await (tx as any).subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'ACTIVE' as SubscriptionStatusType,
              activatedAt: new Date(),
              lastPaymentDate: new Date(),
              totalBillingCycles: { increment: 1 },
              totalAmountPaid: { increment: subscription.planAmount },
              // Update dates from Razorpay if available
              ...(razorpaySubscriptionDetails?.current_start && {
                currentPeriodStart: new Date(razorpaySubscriptionDetails.current_start * 1000),
              }),
              ...(razorpaySubscriptionDetails?.current_end && {
                currentPeriodEnd: new Date(razorpaySubscriptionDetails.current_end * 1000),
                nextBillingDate: new Date(razorpaySubscriptionDetails.current_end * 1000),
              }),
            },
          });

          // Update user subscription tier and status
          await tx.user.update({
            where: { id: userId },
            data: {
              subscriptionTier: 'PRO' as SubscriptionTierType,
              subscriptionStatus: 'ACTIVE' as SubscriptionStatusType,
              subscriptionStartDate: updated.activatedAt,
              subscriptionEndDate: updated.currentPeriodEnd,
            },
          });

          // Create payment record
          // Map Razorpay payment status to our PaymentStatus enum
          let paymentStatus: string;
          if (razorpayPaymentDetails.status === 'captured') {
            paymentStatus = 'CAPTURED';
          } else if (razorpayPaymentDetails.status === 'authorized') {
            paymentStatus = 'AUTHORIZED';
          } else if (razorpayPaymentDetails.status === 'refunded') {
            paymentStatus = 'REFUNDED';
          } else {
            paymentStatus = 'PENDING';
          }

          const paymentRecord = await (tx as any).payment.create({
            data: {
              userId,
              subscriptionId: subscription.id,
              razorpayPaymentId,
              razorpayOrderId: razorpayPaymentDetails.order_id || '',
              razorpaySignature: razorpaySignature || null,
              amount: razorpayPaymentDetails.amount,
              currency: razorpayPaymentDetails.currency || 'INR',
              status: paymentStatus,
              method: razorpayPaymentDetails.method?.toUpperCase() as any || null,
              cardNetwork: razorpayPaymentDetails.card?.network || null,
              cardLast4: razorpayPaymentDetails.card?.last4 || null,
              bankName: razorpayPaymentDetails.bank || null,
              walletName: razorpayPaymentDetails.wallet || null,
              vpa: razorpayPaymentDetails.vpa || null,
              email: razorpayPaymentDetails.email || subscription.user.email,
              contact: razorpayPaymentDetails.contact || null,
              capturedAt: razorpayPaymentDetails.status === 'captured' ? new Date() : null,
              refundedAt: razorpayPaymentDetails.status === 'refunded' ? new Date() : null,
              metadata: {
                razorpaySubscriptionId,
                verifiedAt: new Date().toISOString(),
                isAuthenticationCharge: razorpayPaymentDetails.status === 'refunded' && razorpayPaymentDetails.amount < subscription.planAmount,
              },
            },
          });

          // Create audit log
          await (tx as any).subscriptionAuditLog.create({
            data: {
              userId,
              subscriptionId: subscription.id,
              paymentId: paymentRecord.id,
              action: 'PAYMENT_SUCCEEDED',
              actor: 'USER',
              actorId: userId,
              previousState: {
                status: 'INACTIVE',
                tier: subscription.user.subscriptionTier,
              },
              newState: {
                status: 'ACTIVE',
                tier: 'PRO',
              },
              reason: 'Payment verified and subscription activated',
              metadata: {
                razorpayPaymentId,
                razorpaySubscriptionId,
                amount: razorpayPaymentDetails.amount,
                paymentMethod: razorpayPaymentDetails.method,
              },
            },
          });

          return updated;
        });

        logger.info('Subscription activated successfully', {
          userId,
          subscriptionId: subscription.id,
          razorpayPaymentId,
          razorpaySubscriptionId,
        });
      } catch (error) {
        logger.error('Failed to activate subscription', {
          userId,
          subscriptionId: subscription.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new AppError(
          'Failed to activate subscription',
          500,
          'ACTIVATION_FAILED',
          error instanceof Error ? error.message : undefined
        );
      }

      // STEP 10: Send welcome email (async, don't block response)
      // TODO: Implement email sending
      // sendWelcomeEmail(subscription.user.email, subscription).catch(error => {
      //   logger.error('Failed to send welcome email', { userId, error });
      // });

      // Return success response
      return {
        verified: true,
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
          tier: 'PRO',
          planType: updatedSubscription.planType,
          currentPeriodStart: updatedSubscription.currentPeriodStart,
          currentPeriodEnd: updatedSubscription.currentPeriodEnd,
          nextBillingDate: updatedSubscription.nextBillingDate,
        },
      };
    } catch (error) {
      // Log the error if not already an AppError
      if (!(error instanceof AppError)) {
        logger.error('Unexpected error verifying payment', {
          userId,
          razorpayPaymentId,
          razorpaySubscriptionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Re-throw AppError as-is, wrap others
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'Failed to verify payment',
        500,
        'PAYMENT_VERIFICATION_FAILED',
        error instanceof Error ? error.message : undefined
      );
    }
  }

  /**
   * Get user's current subscription with comprehensive status checks
   * Handles expiration detection and optional Razorpay sync
   */
  async getCurrentSubscription(
    userId: string,
    syncWithRazorpay: boolean = false
  ): Promise<CurrentSubscriptionResponse> {
    logger.info('Fetching current subscription', { userId, syncWithRazorpay });

    try {
      // STEP 1: Fetch user with subscription details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionStartDate: true,
          subscriptionEndDate: true,
          razorpayCustomerId: true,
        } as any,
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // STEP 2: Get the most recent subscription (active or last one)
      // Priority: ACTIVE > CANCELLED (with valid period) > EXPIRED > Others
      const subscriptions = await prismaModels.subscription.findMany({
        where: { userId },
        orderBy: [
          { status: 'asc' }, // ACTIVE first
          { currentPeriodEnd: 'desc' }, // Most recent period
        ],
        take: 5, // Get last 5 to find the best match
      });

      // STEP 3: Handle no subscription case
      if (subscriptions.length === 0) {
        logger.info('No subscription found for user', { userId });
        return {
          hasActiveSubscription: false,
          subscription: null,
          user: {
            subscriptionTier: (user.subscriptionTier as unknown as SubscriptionTierType),
            subscriptionStatus: (user.subscriptionStatus as unknown as SubscriptionStatusType),
          },
        };
      }

      // STEP 4: Find the best subscription to return
      // Preference: ACTIVE > CANCELLED (with valid period) > Most recent
      let currentSubscription = subscriptions.find(
        (sub: any) => sub.status === 'ACTIVE'
      );

      if (!currentSubscription) {
        // Check for cancelled but still valid subscription
        const now = new Date();
        currentSubscription = subscriptions.find(
          (sub: any) =>
            sub.status === 'CANCELLED' &&
            sub.currentPeriodEnd > now &&
            sub.cancelAtPeriodEnd
        );
      }

      if (!currentSubscription) {
        // Return the most recent subscription (first in the list)
        currentSubscription = subscriptions[0];
      }

      // STEP 5: Check if subscription is expired
      const now = new Date();
      const isExpired = currentSubscription.currentPeriodEnd < now;

      // STEP 6: Handle expired subscription - downgrade user
      if (
        isExpired &&
        currentSubscription.status === 'ACTIVE' &&
        !currentSubscription.cancelAtPeriodEnd
      ) {
        logger.warn('Detected expired active subscription, downgrading user', {
          userId,
          subscriptionId: currentSubscription.id,
          currentPeriodEnd: currentSubscription.currentPeriodEnd,
        });

        try {
          await prisma.$transaction(async (tx) => {
            // Update subscription status to EXPIRED
            await (tx as any).subscription.update({
              where: { id: currentSubscription.id },
              data: {
                status: 'EXPIRED',
              },
            });

            // Downgrade user to FREE
            await tx.user.update({
              where: { id: userId },
              data: {
                subscriptionTier: 'FREE' as SubscriptionTierType,
                subscriptionStatus: 'INACTIVE' as SubscriptionStatusType,
                subscriptionEndDate: currentSubscription.currentPeriodEnd,
              },
            });

            // Create audit log
            await (tx as any).subscriptionAuditLog.create({
              data: {
                userId,
                subscriptionId: currentSubscription.id,
                action: 'EXPIRED',
                actor: 'SYSTEM',
                actorId: 'system',
                previousState: {
                  status: 'ACTIVE',
                  tier: 'PRO',
                },
                newState: {
                  status: 'EXPIRED',
                  tier: 'FREE',
                },
                reason: 'Subscription period ended - automatic downgrade',
              },
            });
          });

          // Update local object for response
          currentSubscription.status = 'EXPIRED';
          (user as any).subscriptionTier = 'FREE';
          (user as any).subscriptionStatus = 'INACTIVE';

          logger.info('User downgraded successfully', { userId });
        } catch (error) {
          logger.error('Failed to downgrade expired subscription', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          // Don't fail the request, just log the error
        }
      }

      // STEP 7: Optional sync with Razorpay
      if (syncWithRazorpay && currentSubscription.razorpaySubscriptionId) {
        logger.info('Syncing subscription with Razorpay', {
          userId,
          razorpaySubscriptionId: currentSubscription.razorpaySubscriptionId,
        });

        try {
          const razorpaySubscription = await razorpay.subscriptions.fetch(
            currentSubscription.razorpaySubscriptionId
          );

          // Check for status mismatch
          const razorpayStatus = razorpaySubscription.status.toUpperCase();
          const dbStatus = currentSubscription.status;

          if (razorpayStatus !== dbStatus) {
            logger.warn('Subscription status mismatch detected', {
              userId,
              dbStatus,
              razorpayStatus,
              razorpaySubscriptionId: currentSubscription.razorpaySubscriptionId,
            });

            // Update our database to match Razorpay (source of truth)
            const updatedSubscription = await prismaModels.subscription.update({
              where: { id: currentSubscription.id },
              data: {
                status: razorpayStatus as SubscriptionStatusType,
                ...(razorpaySubscription.current_start && {
                  currentPeriodStart: new Date(razorpaySubscription.current_start * 1000),
                }),
                ...(razorpaySubscription.current_end && {
                  currentPeriodEnd: new Date(razorpaySubscription.current_end * 1000),
                  nextBillingDate: new Date(razorpaySubscription.current_end * 1000),
                }),
              },
            });

            // Update local reference
            currentSubscription = { ...currentSubscription, ...updatedSubscription } as any;

            // Also update user if needed
            if (razorpayStatus === 'ACTIVE' && (user.subscriptionTier as any) !== 'PRO') {
              await prisma.user.update({
                where: { id: userId },
                data: {
                  subscriptionTier: 'PRO' as SubscriptionTierType,
                  subscriptionStatus: 'ACTIVE' as SubscriptionStatusType,
                },
              });
              (user as any).subscriptionTier = 'PRO';
              (user as any).subscriptionStatus = 'ACTIVE';
            } else if (razorpayStatus === 'EXPIRED' || razorpayStatus === 'CANCELLED') {
              await prisma.user.update({
                where: { id: userId },
                data: {
                  subscriptionTier: 'FREE' as SubscriptionTierType,
                  subscriptionStatus: 'INACTIVE' as SubscriptionStatusType,
                },
              });
              (user as any).subscriptionTier = 'FREE';
              (user as any).subscriptionStatus = 'INACTIVE';
            }

            logger.info('Subscription synced with Razorpay successfully', {
              userId,
              updatedStatus: razorpayStatus,
            });
          }
        } catch (error) {
          logger.error('Failed to sync with Razorpay', {
            userId,
            razorpaySubscriptionId: currentSubscription.razorpaySubscriptionId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          // Don't fail the request, just log the error
        }
      }

      // STEP 8: Calculate days remaining
      const daysRemaining = Math.max(
        0,
        Math.ceil(
          (currentSubscription.currentPeriodEnd.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
        )
      );

      // STEP 9: Determine if has active subscription
      const hasActiveSubscription =
        currentSubscription.status === 'ACTIVE' ||
        (currentSubscription.status === 'CANCELLED' &&
          currentSubscription.cancelAtPeriodEnd &&
          !isExpired);

      // Fetch plan details from PlanConfiguration
      const plan = await prismaModels.planConfiguration.findFirst({
        where: {
          billingPeriod: currentSubscription.planType as any,
          isActive: true,
        },
      });

      // Return comprehensive subscription data
      return {
        hasActiveSubscription,
        subscription: {
          id: currentSubscription.id,
          status: currentSubscription.status,
          tier: hasActiveSubscription ? 'PRO' : 'FREE',
          planId: plan?.planId || `pro_${currentSubscription.planType.toLowerCase()}`,
          planName: plan?.name || `Pro ${currentSubscription.planType}`,
          planType: currentSubscription.planType,
          amount: currentSubscription.planAmount,
          currency: currentSubscription.currency || 'INR',
          currentPeriodStart: currentSubscription.currentPeriodStart,
          currentPeriodEnd: currentSubscription.currentPeriodEnd,
          nextBillingDate: currentSubscription.nextBillingDate,
          cancelledAt: currentSubscription.cancelledAt,
          cancelAtPeriodEnd: currentSubscription.cancelAtPeriodEnd || false,
          autoRenewal: currentSubscription.autoRenew || false,
          totalBillingCycles: currentSubscription.totalBillingCycles,
          daysRemaining,
          isExpired,
        },
        user: {
          subscriptionTier: (user.subscriptionTier as unknown as SubscriptionTierType),
          subscriptionStatus: (user.subscriptionStatus as unknown as SubscriptionStatusType),
        },
      };
    } catch (error) {
      // Log the error if not already an AppError
      if (!(error instanceof AppError)) {
        logger.error('Unexpected error fetching subscription', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Re-throw AppError as-is, wrap others
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'Failed to fetch subscription',
        500,
        'FETCH_SUBSCRIPTION_FAILED',
        error instanceof Error ? error.message : undefined
      );
    }
  }

  /**
   * Cancel subscription with flexible options
   * Handles immediate cancellation or cancel at period end
   * Includes comprehensive validation and Razorpay integration
   */
  async cancelSubscription(
    userId: string,
    data: CancelSubscriptionInput
  ): Promise<CancelSubscriptionResponse> {
    const { cancelAtPeriodEnd = true, reason } = data;

    logger.info('Cancelling subscription', {
      userId,
      cancelAtPeriodEnd,
      reason: reason ? 'provided' : 'none',
    });

    try {
      // STEP 1: Find user's active subscription
      const subscription = await prismaModels.subscription.findFirst({
        where: {
          userId,
          status: {
            in: ['ACTIVE', 'INCOMPLETE'], // Can cancel active or incomplete
          },
        },
        orderBy: {
          createdAt: 'desc', // Get most recent active subscription
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              subscriptionTier: true,
              subscriptionStatus: true,
            },
          },
        },
      });

      // EDGE CASE 1: No active subscription to cancel
      if (!subscription) {
        logger.warn('No active subscription found to cancel', { userId });
        throw new AppError(
          'No active subscription found to cancel',
          404,
          'NO_ACTIVE_SUBSCRIPTION'
        );
      }

      // EDGE CASE 2: Subscription already cancelled
      if (subscription.status === 'CANCELLED') {
        logger.warn('Subscription already cancelled', {
          userId,
          subscriptionId: subscription.id,
          cancelledAt: subscription.cancelledAt,
        });
        throw new AppError(
          'Subscription is already cancelled',
          400,
          'ALREADY_CANCELLED'
        );
      }

      // EDGE CASE 3: Subscription already expired
      const now = new Date();
      if (subscription.currentPeriodEnd < now) {
        logger.warn('Cannot cancel expired subscription', {
          userId,
          subscriptionId: subscription.id,
          currentPeriodEnd: subscription.currentPeriodEnd,
        });
        throw new AppError(
          'Cannot cancel expired subscription',
          400,
          'SUBSCRIPTION_EXPIRED'
        );
      }

      // STEP 2: Cancel subscription on Razorpay
      if (!subscription.razorpaySubscriptionId) {
        logger.error('Missing Razorpay subscription ID', {
          userId,
          subscriptionId: subscription.id,
        });
        throw new AppError(
          'Invalid subscription state - missing Razorpay ID',
          500,
          'INVALID_SUBSCRIPTION_STATE'
        );
      }

      let razorpayCancelled = false;
      try {
        // Cancel on Razorpay with cancel_at_cycle_end option
        await razorpay.subscriptions.cancel(
          subscription.razorpaySubscriptionId,
          cancelAtPeriodEnd // If true, cancels at period end; if false, cancels immediately
        );

        razorpayCancelled = true;
        logger.info('Subscription cancelled on Razorpay', {
          userId,
          razorpaySubscriptionId: subscription.razorpaySubscriptionId,
          cancelAtPeriodEnd,
        });
      } catch (error: any) {
        // Check if already cancelled on Razorpay (idempotency)
        if (error?.error?.code === 'BAD_REQUEST_ERROR' &&
          error?.error?.description?.includes('already been cancelled')) {
          logger.warn('Subscription already cancelled on Razorpay', {
            userId,
            razorpaySubscriptionId: subscription.razorpaySubscriptionId,
          });
          razorpayCancelled = true; // Treat as success (idempotent)
        } else {
          logger.error('Failed to cancel subscription on Razorpay', {
            userId,
            razorpaySubscriptionId: subscription.razorpaySubscriptionId,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: error?.error?.code,
          });
          throw new AppError(
            'Failed to cancel subscription with payment provider',
            500,
            'RAZORPAY_CANCEL_FAILED',
            error instanceof Error ? error.message : undefined
          );
        }
      }

      // STEP 3: Determine access end date and user tier
      const accessUntil = cancelAtPeriodEnd
        ? subscription.currentPeriodEnd
        : now;

      const newUserTier = cancelAtPeriodEnd
        ? subscription.user.subscriptionTier // Keep current tier until period ends
        : 'FREE' as SubscriptionTierType; // Downgrade immediately

      const newUserStatus = cancelAtPeriodEnd
        ? subscription.user.subscriptionStatus // Keep current status until period ends
        : 'INACTIVE' as SubscriptionStatusType; // Set inactive immediately

      // STEP 4: Update database in a transaction
      let updatedSubscription;
      try {
        updatedSubscription = await prisma.$transaction(async (tx) => {
          // Update subscription
          const updated = await (tx as any).subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'CANCELLED' as SubscriptionStatusType,
              cancelledAt: now,
              cancelAtPeriodEnd,
              cancelReason: reason || null,
              autoRenewal: false,
              nextBillingDate: null, // No more billing
            },
          });

          // Update user tier if immediate cancellation
          await tx.user.update({
            where: { id: userId },
            data: {
              subscriptionTier: newUserTier,
              subscriptionStatus: newUserStatus,
              ...(cancelAtPeriodEnd ? {} : {
                subscriptionEndDate: now,
              }),
            },
          });

          // Create audit log
          await (tx as any).subscriptionAuditLog.create({
            data: {
              userId,
              subscriptionId: subscription.id,
              action: 'CANCELLED',
              actor: 'USER',
              actorId: userId,
              previousState: {
                status: subscription.status,
                tier: subscription.user.subscriptionTier,
                autoRenewal: subscription.autoRenewal,
              },
              newState: {
                status: 'CANCELLED',
                tier: newUserTier,
                autoRenewal: false,
                cancelAtPeriodEnd,
                accessUntil: accessUntil.toISOString(),
              },
              reason: reason || `User cancelled subscription (${cancelAtPeriodEnd ? 'at period end' : 'immediate'})`,
              metadata: {
                cancelAtPeriodEnd,
                cancelReason: reason,
                razorpaySubscriptionId: subscription.razorpaySubscriptionId,
                currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
              },
            },
          });

          return updated;
        });

        logger.info('Subscription cancelled successfully in database', {
          userId,
          subscriptionId: subscription.id,
          cancelAtPeriodEnd,
        });
      } catch (error) {
        logger.error('Failed to update subscription cancellation in database', {
          userId,
          subscriptionId: subscription.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // CRITICAL: We cancelled on Razorpay but failed in DB
        // Log for manual reconciliation
        logger.error('CRITICAL: Razorpay cancelled but DB update failed - manual reconciliation needed', {
          userId,
          subscriptionId: subscription.id,
          razorpaySubscriptionId: subscription.razorpaySubscriptionId,
        });

        throw new AppError(
          'Failed to update subscription cancellation',
          500,
          'CANCELLATION_UPDATE_FAILED',
          error instanceof Error ? error.message : undefined
        );
      }

      // STEP 5: Send cancellation email (async, don't block response)
      // TODO: Implement email sending
      // sendCancellationEmail(subscription.user.email, {
      //   accessUntil,
      //   cancelAtPeriodEnd,
      // }).catch(error => {
      //   logger.error('Failed to send cancellation email', { userId, error });
      // });

      // STEP 6: Prepare response message
      const message = cancelAtPeriodEnd
        ? `Subscription cancelled. You'll retain PRO access until ${accessUntil.toLocaleDateString()}.`
        : 'Subscription cancelled immediately. You have been downgraded to the FREE plan.';

      // Return success response
      return {
        cancelled: true,
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
          cancelledAt: updatedSubscription.cancelledAt!,
          cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
          accessUntil,
          refundAmount: null, // TODO: Implement refund logic if needed
        },
        message,
      };
    } catch (error) {
      // Log the error if not already an AppError
      if (!(error instanceof AppError)) {
        logger.error('Unexpected error cancelling subscription', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Re-throw AppError as-is, wrap others
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'Failed to cancel subscription',
        500,
        'SUBSCRIPTION_CANCELLATION_FAILED',
        error instanceof Error ? error.message : undefined
      );
    }
  }

  /**
   * Resume a cancelled subscription
   * Only works for subscriptions cancelled with cancelAtPeriodEnd = true
   * Must be resumed before the period ends
   */
  async resumeSubscription(userId: string): Promise<ResumeSubscriptionResponse> {
    logger.info('Resuming subscription', { userId });

    try {
      // STEP 1: Find user's cancelled subscription that can be resumed
      const subscription = await prismaModels.subscription.findFirst({
        where: {
          userId,
          status: 'CANCELLED',
          cancelAtPeriodEnd: true, // Can only resume if set to cancel at period end
        },
        orderBy: {
          cancelledAt: 'desc', // Get most recently cancelled
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              subscriptionTier: true,
              subscriptionStatus: true,
            },
          },
        },
      });

      // EDGE CASE 1: No cancelled subscription found
      if (!subscription) {
        logger.warn('No cancelled subscription found to resume', { userId });
        throw new AppError(
          'No cancelled subscription found. You can only resume subscriptions that were set to cancel at period end.',
          404,
          'NO_CANCELLED_SUBSCRIPTION'
        );
      }

      // EDGE CASE 2: Subscription period already ended (expired)
      const now = new Date();
      if (subscription.currentPeriodEnd < now) {
        logger.warn('Cannot resume expired subscription', {
          userId,
          subscriptionId: subscription.id,
          currentPeriodEnd: subscription.currentPeriodEnd,
        });
        throw new AppError(
          'Cannot resume this subscription as the billing period has already ended. Please create a new subscription.',
          400,
          'SUBSCRIPTION_PERIOD_ENDED'
        );
      }

      // EDGE CASE 3: Subscription was cancelled immediately (cannot resume)
      if (!subscription.cancelAtPeriodEnd) {
        logger.warn('Cannot resume immediately cancelled subscription', {
          userId,
          subscriptionId: subscription.id,
        });
        throw new AppError(
          'This subscription was cancelled immediately and cannot be resumed. Please create a new subscription.',
          400,
          'CANNOT_RESUME_IMMEDIATE_CANCELLATION'
        );
      }

      // EDGE CASE 4: Missing Razorpay subscription ID
      if (!subscription.razorpaySubscriptionId) {
        logger.error('Missing Razorpay subscription ID', {
          userId,
          subscriptionId: subscription.id,
        });
        throw new AppError(
          'Invalid subscription state - missing Razorpay ID',
          500,
          'INVALID_SUBSCRIPTION_STATE'
        );
      }

      // STEP 2: Resume subscription on Razorpay
      let razorpayResumed = false;
      let razorpaySubscriptionDetails: any = null;
      try {
        // Fetch current status from Razorpay first
        razorpaySubscriptionDetails = await razorpay.subscriptions.fetch(
          subscription.razorpaySubscriptionId
        ) as any;

        // Check if already active on Razorpay (idempotency)
        if (razorpaySubscriptionDetails?.status === 'active') {
          logger.info('Subscription already active on Razorpay', {
            userId,
            razorpaySubscriptionId: subscription.razorpaySubscriptionId,
          });
          razorpayResumed = true;
        } else if (razorpaySubscriptionDetails?.status === 'cancelled') {
          // Try to resume (note: Razorpay may not support resuming after cancellation)
          // We'll need to check Razorpay docs - they might require creating a new subscription
          // For now, we'll try to update the subscription
          try {
            await razorpay.subscriptions.update(
              subscription.razorpaySubscriptionId,
              {
                // Note: Razorpay API might not support this directly
                // May need to use pause/resume API or create new subscription
              } as any
            );
            razorpayResumed = true;
            logger.info('Subscription resumed on Razorpay', {
              userId,
              razorpaySubscriptionId: subscription.razorpaySubscriptionId,
            });
          } catch (updateError: any) {
            // If update fails, check if it's because subscription can't be resumed
            logger.error('Failed to update Razorpay subscription', {
              userId,
              razorpaySubscriptionId: subscription.razorpaySubscriptionId,
              error: updateError?.message,
            });
            throw updateError;
          }
        } else {
          logger.warn('Unexpected Razorpay subscription status', {
            userId,
            razorpaySubscriptionId: subscription.razorpaySubscriptionId,
            status: razorpaySubscriptionDetails.status,
          });
        }
      } catch (error: any) {
        logger.error('Failed to resume subscription on Razorpay', {
          userId,
          razorpaySubscriptionId: subscription.razorpaySubscriptionId,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorCode: error?.error?.code,
        });
        throw new AppError(
          'Failed to resume subscription with payment provider',
          500,
          'RAZORPAY_RESUME_FAILED',
          error instanceof Error ? error.message : undefined
        );
      }

      // STEP 3: Update database in a transaction
      let updatedSubscription;
      try {
        updatedSubscription = await prisma.$transaction(async (tx) => {
          // Update subscription status back to ACTIVE
          const updated = await (tx as any).subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'ACTIVE' as SubscriptionStatusType,
              cancelledAt: null, // Clear cancellation date
              cancelAtPeriodEnd: false, // Clear cancel flag
              cancelReason: null, // Clear cancel reason
              autoRenewal: true, // Re-enable auto-renewal
              // Update dates from Razorpay if available
              ...(razorpaySubscriptionDetails?.current_start && {
                currentPeriodStart: new Date(razorpaySubscriptionDetails.current_start * 1000),
              }),
              ...(razorpaySubscriptionDetails?.current_end && {
                currentPeriodEnd: new Date(razorpaySubscriptionDetails.current_end * 1000),
                nextBillingDate: new Date(razorpaySubscriptionDetails.current_end * 1000),
              }),
            },
          });

          // Update user tier (ensure PRO and ACTIVE)
          await tx.user.update({
            where: { id: userId },
            data: {
              subscriptionTier: 'PRO' as SubscriptionTierType,
              subscriptionStatus: 'ACTIVE' as SubscriptionStatusType,
              subscriptionStartDate: subscription.activatedAt || subscription.createdAt,
              subscriptionEndDate: updated.currentPeriodEnd,
            },
          });

          // Create audit log
          await (tx as any).subscriptionAuditLog.create({
            data: {
              userId,
              subscriptionId: subscription.id,
              action: 'RESUMED',
              actor: 'USER',
              actorId: userId,
              previousState: {
                status: 'CANCELLED',
                tier: subscription.user.subscriptionTier,
                cancelAtPeriodEnd: true,
                cancelledAt: subscription.cancelledAt?.toISOString(),
              },
              newState: {
                status: 'ACTIVE',
                tier: 'PRO',
                autoRenewal: true,
                nextBillingDate: updated.nextBillingDate?.toISOString(),
              },
              reason: 'User resumed cancelled subscription',
              metadata: {
                razorpaySubscriptionId: subscription.razorpaySubscriptionId,
                currentPeriodEnd: updated.currentPeriodEnd.toISOString(),
                resumedBeforeExpiry: true,
              },
            },
          });

          return updated;
        });

        logger.info('Subscription resumed successfully in database', {
          userId,
          subscriptionId: subscription.id,
        });
      } catch (error) {
        logger.error('Failed to update subscription resume in database', {
          userId,
          subscriptionId: subscription.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // CRITICAL: We resumed on Razorpay but failed in DB
        // Log for manual reconciliation
        logger.error('CRITICAL: Razorpay resumed but DB update failed - manual reconciliation needed', {
          userId,
          subscriptionId: subscription.id,
          razorpaySubscriptionId: subscription.razorpaySubscriptionId,
        });

        throw new AppError(
          'Failed to update subscription resume',
          500,
          'RESUME_UPDATE_FAILED',
          error instanceof Error ? error.message : undefined
        );
      }

      // STEP 4: Send resume confirmation email (async, don't block response)
      // TODO: Implement email sending
      // sendResumeEmail(subscription.user.email, {
      //   nextBillingDate: updatedSubscription.nextBillingDate,
      // }).catch(error => {
      //   logger.error('Failed to send resume email', { userId, error });
      // });

      // Return success response
      return {
        resumed: true,
        subscription: {
          id: updatedSubscription.id,
          status: updatedSubscription.status,
          resumedAt: new Date(),
          currentPeriodEnd: updatedSubscription.currentPeriodEnd,
          nextBillingDate: updatedSubscription.nextBillingDate,
          autoRenewal: updatedSubscription.autoRenewal,
        },
        message: `Subscription resumed successfully! Your PRO access will continue and billing will resume on ${updatedSubscription.nextBillingDate?.toLocaleDateString() || 'the next billing date'}.`,
      };
    } catch (error) {
      // Log the error if not already an AppError
      if (!(error instanceof AppError)) {
        logger.error('Unexpected error resuming subscription', {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Re-throw AppError as-is, wrap others
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'Failed to resume subscription',
        500,
        'SUBSCRIPTION_RESUME_FAILED',
        error instanceof Error ? error.message : undefined
      );
    }
  }
}
