import { prisma } from '../lib/prisma.js';
import { razorpay } from '../lib/razorpay.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { verifyWebhookSignature } from '../utils/razorpay-signature.js';
import {
  RazorpayWebhookPayload,
  WebhookProcessingResult,
} from '../types/webhook.types.js';
import pkg from '@prisma/client';
const { SubscriptionTier, SubscriptionStatus, WebhookStatus, RazorpayEventType } = pkg;
import type {
  SubscriptionTier as SubscriptionTierType,
  SubscriptionStatus as SubscriptionStatusType,
  WebhookStatus as WebhookStatusType,
  RazorpayEventType as RazorpayEventTypeType,
} from '@prisma/client';

export class WebhookService {
  /**
   * Process incoming Razorpay webhook
   * CRITICAL: Handles signature verification, idempotency, and event routing
   */
  async processWebhook(
    rawBody: string,
    signature: string
  ): Promise<WebhookProcessingResult> {
    logger.info('Processing Razorpay webhook', {
      signatureProvided: !!signature,
      bodyLength: rawBody.length,
    });

    try {
      // STEP 1: Verify webhook signature (CRITICAL SECURITY CHECK)
      const isSignatureValid = verifyWebhookSignature(rawBody, signature);

      if (!isSignatureValid) {
        logger.error('Webhook signature verification failed', {
          signature: signature.substring(0, 10) + '...',
        });

        throw new AppError(
          'Invalid webhook signature',
          401,
          'INVALID_WEBHOOK_SIGNATURE'
        );
      }

      logger.info('Webhook signature verified successfully');

      // STEP 2: Parse webhook payload
      let payload: RazorpayWebhookPayload;
      try {
        payload = JSON.parse(rawBody);
      } catch (error) {
        logger.error('Failed to parse webhook payload', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw new AppError('Invalid webhook payload', 400, 'INVALID_PAYLOAD');
      }

      const eventType = payload.event;
      const eventId = `${payload.event}_${payload.created_at}_${Math.random().toString(36).substring(7)}`;

      logger.info('Webhook event received', {
        eventType,
        eventId,
        accountId: payload.account_id,
      });

      // STEP 3: Check for idempotency (prevent duplicate processing)
      const existingEvent = await prisma.webhookEvent.findFirst({
        where: {
          razorpayEventId: eventId,
          eventType: eventType as RazorpayEventTypeType,
        },
      });

      if (existingEvent) {
        logger.warn('Duplicate webhook event detected (idempotency)', {
          eventId,
          eventType,
          existingEventId: existingEvent.id,
          status: existingEvent.status,
        });

        // If already processed successfully, return success
        if (existingEvent.status === 'PROCESSED') {
          return {
            processed: true,
            eventType,
            eventId,
            message: 'Event already processed (idempotent)',
          };
        }

        // If previous attempt failed, we'll retry
        logger.info('Retrying previously failed webhook event', {
          eventId,
          previousAttempts: existingEvent.retryCount,
        });
      }

      // STEP 4: Store webhook event (for audit trail and idempotency)
      const webhookEvent = await prisma.webhookEvent.create({
        data: {
          razorpayEventId: eventId,
          eventType: eventType as RazorpayEventTypeType,
          payload: payload as any,
          signature,
          signatureVerified: true,
          status: 'PENDING' as WebhookStatusType,
          receivedAt: new Date(),
        },
      });

      logger.info('Webhook event stored', {
        webhookEventId: webhookEvent.id,
        eventType,
      });

      // STEP 5: Update webhook status to PROCESSING
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: 'PROCESSING' as WebhookStatusType,
        },
      });

      // STEP 6: Route to appropriate event handler
      let result: string;
      try {
        result = await this.routeWebhookEvent(payload, webhookEvent.id);
      } catch (error) {
        // Log error and update webhook status
        logger.error('Webhook event processing failed', {
          webhookEventId: webhookEvent.id,
          eventType,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        await prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: {
            status: 'FAILED' as WebhookStatusType,
            errorMessage:
              error instanceof Error ? error.message : 'Unknown error',
            retryCount: { increment: 1 },
            processedAt: new Date(),
          },
        });

        throw error;
      }

      // STEP 7: Mark webhook as processed successfully
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: 'PROCESSED' as WebhookStatusType,
          processedAt: new Date(),
        },
      });

      logger.info('Webhook event processed successfully', {
        webhookEventId: webhookEvent.id,
        eventType,
        result,
      });

      return {
        processed: true,
        eventType,
        eventId: webhookEvent.id,
        message: result,
      };
    } catch (error) {
      // Log the error if not already an AppError
      if (!(error instanceof AppError)) {
        logger.error('Unexpected error processing webhook', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Re-throw AppError as-is, wrap others
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'Failed to process webhook',
        500,
        'WEBHOOK_PROCESSING_FAILED',
        error instanceof Error ? error.message : undefined
      );
    }
  }

  /**
   * Route webhook event to appropriate handler based on event type
   */
  private async routeWebhookEvent(
    payload: RazorpayWebhookPayload,
    webhookEventId: string
  ): Promise<string> {
    const eventType = payload.event;

    logger.info('Routing webhook event', { eventType, webhookEventId });

    switch (eventType) {
      case 'subscription.activated':
        return await this.handleSubscriptionActivated(payload, webhookEventId);

      case 'subscription.charged':
        return await this.handleSubscriptionCharged(payload, webhookEventId);

      case 'subscription.cancelled':
        return await this.handleSubscriptionCancelled(payload, webhookEventId);

      case 'subscription.completed':
        return await this.handleSubscriptionCompleted(payload, webhookEventId);

      case 'subscription.pending':
        return await this.handleSubscriptionPending(payload, webhookEventId);

      case 'subscription.halted':
        return await this.handleSubscriptionHalted(payload, webhookEventId);

      case 'subscription.resumed':
        return await this.handleSubscriptionResumed(payload, webhookEventId);

      case 'subscription.paused':
        return await this.handleSubscriptionPaused(payload, webhookEventId);

      case 'payment.failed':
        return await this.handlePaymentFailed(payload, webhookEventId);

      case 'refund.processed':
        return await this.handleRefundProcessed(payload, webhookEventId);

      default:
        logger.warn('Unknown webhook event type', { eventType });
        return `Unknown event type: ${eventType}`;
    }
  }

  /**
   * Handle subscription.activated event
   * This is when the first payment succeeds and subscription becomes active
   */
  private async handleSubscriptionActivated(
    payload: RazorpayWebhookPayload,
    webhookEventId: string
  ): Promise<string> {
    const subscriptionData = payload.payload.subscription?.entity;

    if (!subscriptionData) {
      throw new AppError('Missing subscription data', 400, 'MISSING_DATA');
    }

    logger.info('Handling subscription.activated', {
      razorpaySubscriptionId: subscriptionData.id,
      webhookEventId,
    });

    // Find subscription in our database
    const subscription = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: subscriptionData.id },
      include: { user: true },
    });

    if (!subscription) {
      logger.warn('Subscription not found for activation webhook', {
        razorpaySubscriptionId: subscriptionData.id,
      });
      return 'Subscription not found in database';
    }

    // Check if already active (idempotency / race condition)
    if (subscription.status === 'ACTIVE') {
      logger.info('Subscription already active (idempotent)', {
        subscriptionId: subscription.id,
      });
      return 'Subscription already active';
    }

    // Update subscription and user in transaction
    await prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE' as SubscriptionStatusType,
          activatedAt: new Date(),
          currentPeriodStart: new Date(subscriptionData.current_start * 1000),
          currentPeriodEnd: new Date(subscriptionData.current_end * 1000),
          nextBillingDate: new Date(subscriptionData.current_end * 1000),
          totalBillingCycles: subscriptionData.paid_count,
        },
      });

      await tx.user.update({
        where: { id: subscription.userId },
        data: {
          subscriptionTier: 'PRO' as SubscriptionTierType,
          subscriptionStatus: 'ACTIVE' as SubscriptionStatusType,
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(subscriptionData.current_end * 1000),
        },
      });

      // Link webhook to subscription
      await tx.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          subscriptionId: subscription.id,
          userId: subscription.userId,
        },
      });

      // Create audit log
      await tx.subscriptionAuditLog.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          action: 'ACTIVATED',
          actor: 'WEBHOOK',
          actorId: 'razorpay',
          previousState: { status: subscription.status },
          newState: { status: 'ACTIVE' },
          reason: 'Webhook: subscription.activated',
        },
      });
    });

    logger.info('Subscription activated via webhook', {
      subscriptionId: subscription.id,
      userId: subscription.userId,
    });

    return `Subscription activated: ${subscription.id}`;
  }

  /**
   * Handle subscription.charged event
   * This is when a recurring payment succeeds
   */
  private async handleSubscriptionCharged(
    payload: RazorpayWebhookPayload,
    webhookEventId: string
  ): Promise<string> {
    const subscriptionData = payload.payload.subscription?.entity;
    const paymentData = payload.payload.payment?.entity;

    if (!subscriptionData || !paymentData) {
      throw new AppError('Missing subscription or payment data', 400, 'MISSING_DATA');
    }

    logger.info('Handling subscription.charged', {
      razorpaySubscriptionId: subscriptionData.id,
      razorpayPaymentId: paymentData.id,
      webhookEventId,
    });

    const subscription = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: subscriptionData.id },
      include: { user: true },
    });

    if (!subscription) {
      logger.warn('Subscription not found for charged webhook', {
        razorpaySubscriptionId: subscriptionData.id,
      });
      return 'Subscription not found in database';
    }

    // Check if payment already recorded (idempotency)
    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayPaymentId: paymentData.id },
    });

    if (existingPayment) {
      logger.info('Payment already recorded (idempotent)', {
        paymentId: existingPayment.id,
      });
      return 'Payment already recorded';
    }

    // Update subscription and record payment in transaction
    await prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE' as SubscriptionStatusType,
          lastPaymentDate: new Date(),
          currentPeriodStart: new Date(subscriptionData.current_start * 1000),
          currentPeriodEnd: new Date(subscriptionData.current_end * 1000),
          nextBillingDate: new Date(subscriptionData.current_end * 1000),
          totalBillingCycles: subscriptionData.paid_count,
          totalAmountPaid: { increment: paymentData.amount },
        },
      });

      // Ensure user is PRO (in case they were downgraded)
      await tx.user.update({
        where: { id: subscription.userId },
        data: {
          subscriptionTier: 'PRO' as SubscriptionTierType,
          subscriptionStatus: 'ACTIVE' as SubscriptionStatusType,
          subscriptionEndDate: new Date(subscriptionData.current_end * 1000),
        },
      });

      // Record payment
      await tx.payment.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          razorpayPaymentId: paymentData.id,
          razorpayOrderId: paymentData.order_id || '',
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: 'CAPTURED',
          method: paymentData.method?.toUpperCase() as any,
          email: paymentData.email,
          contact: paymentData.contact,
          capturedAt: new Date(),
          metadata: {
            webhookEventId,
            subscriptionCharged: true,
          },
        },
      });

      // Link webhook to subscription and payment
      await tx.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          subscriptionId: subscription.id,
          paymentId: paymentData.id,
          userId: subscription.userId,
        },
      });

      // Create audit log
      await tx.subscriptionAuditLog.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          paymentId: paymentData.id,
          action: 'PAYMENT_SUCCEEDED',
          actor: 'WEBHOOK',
          actorId: 'razorpay',
          previousState: { paidCount: subscriptionData.paid_count - 1 },
          newState: { paidCount: subscriptionData.paid_count },
          reason: 'Webhook: subscription.charged',
          metadata: {
            amount: paymentData.amount,
            billingCycle: subscriptionData.paid_count,
          },
        },
      });
    });

    logger.info('Subscription charged via webhook', {
      subscriptionId: subscription.id,
      paymentId: paymentData.id,
      amount: paymentData.amount,
    });

    return `Subscription charged: ${subscription.id}, Payment: ${paymentData.id}`;
  }

  /**
   * Handle subscription.cancelled event
   */
  private async handleSubscriptionCancelled(
    payload: RazorpayWebhookPayload,
    webhookEventId: string
  ): Promise<string> {
    const subscriptionData = payload.payload.subscription?.entity;

    if (!subscriptionData) {
      throw new AppError('Missing subscription data', 400, 'MISSING_DATA');
    }

    logger.info('Handling subscription.cancelled', {
      razorpaySubscriptionId: subscriptionData.id,
      webhookEventId,
    });

    const subscription = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: subscriptionData.id },
    });

    if (!subscription) {
      logger.warn('Subscription not found for cancellation webhook', {
        razorpaySubscriptionId: subscriptionData.id,
      });
      return 'Subscription not found in database';
    }

    // Check if already cancelled (idempotency)
    if (subscription.status === 'CANCELLED') {
      logger.info('Subscription already cancelled (idempotent)', {
        subscriptionId: subscription.id,
      });
      return 'Subscription already cancelled';
    }

    // Update subscription in transaction
    await prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED' as SubscriptionStatusType,
          cancelledAt: new Date(),
          autoRenew: false,
          nextBillingDate: null,
        },
      });

      // Link webhook
      await tx.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          subscriptionId: subscription.id,
          userId: subscription.userId,
        },
      });

      // Create audit log
      await tx.subscriptionAuditLog.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          action: 'CANCELLED',
          actor: 'WEBHOOK',
          actorId: 'razorpay',
          previousState: { status: subscription.status },
          newState: { status: 'CANCELLED' },
          reason: 'Webhook: subscription.cancelled',
        },
      });
    });

    logger.info('Subscription cancelled via webhook', {
      subscriptionId: subscription.id,
    });

    return `Subscription cancelled: ${subscription.id}`;
  }

  /**
   * Handle subscription.completed event
   */
  private async handleSubscriptionCompleted(
    payload: RazorpayWebhookPayload,
    webhookEventId: string
  ): Promise<string> {
    const subscriptionData = payload.payload.subscription?.entity;

    if (!subscriptionData) {
      throw new AppError('Missing subscription data', 400, 'MISSING_DATA');
    }

    logger.info('Handling subscription.completed', {
      razorpaySubscriptionId: subscriptionData.id,
      webhookEventId,
    });

    const subscription = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: subscriptionData.id },
    });

    if (!subscription) {
      logger.warn('Subscription not found for completion webhook', {
        razorpaySubscriptionId: subscriptionData.id,
      });
      return 'Subscription not found in database';
    }

    // Update subscription to completed/expired
    await prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'EXPIRED' as SubscriptionStatusType,
          expiresAt: new Date(),
          autoRenew: false,
          nextBillingDate: null,
        },
      });

      // Downgrade user to FREE
      await tx.user.update({
        where: { id: subscription.userId },
        data: {
          subscriptionTier: 'FREE' as SubscriptionTierType,
          subscriptionStatus: 'INACTIVE' as SubscriptionStatusType,
        },
      });

      // Link webhook
      await tx.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          subscriptionId: subscription.id,
          userId: subscription.userId,
        },
      });

      // Create audit log
      await tx.subscriptionAuditLog.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          action: 'EXPIRED',
          actor: 'WEBHOOK',
          actorId: 'razorpay',
          previousState: { status: subscription.status, tier: 'PRO' },
          newState: { status: 'EXPIRED', tier: 'FREE' },
          reason: 'Webhook: subscription.completed',
        },
      });
    });

    logger.info('Subscription completed via webhook', {
      subscriptionId: subscription.id,
    });

    return `Subscription completed: ${subscription.id}`;
  }

  /**
   * Handle subscription.pending event
   */
  private async handleSubscriptionPending(
    payload: RazorpayWebhookPayload,
    webhookEventId: string
  ): Promise<string> {
    const subscriptionData = payload.payload.subscription?.entity;

    if (!subscriptionData) {
      throw new AppError('Missing subscription data', 400, 'MISSING_DATA');
    }

    logger.info('Handling subscription.pending', {
      razorpaySubscriptionId: subscriptionData.id,
      webhookEventId,
    });

    // Just log this event - no action needed typically
    return `Subscription pending: ${subscriptionData.id}`;
  }

  /**
   * Handle subscription.halted event
   */
  private async handleSubscriptionHalted(
    payload: RazorpayWebhookPayload,
    webhookEventId: string
  ): Promise<string> {
    const subscriptionData = payload.payload.subscription?.entity;

    if (!subscriptionData) {
      throw new AppError('Missing subscription data', 400, 'MISSING_DATA');
    }

    logger.info('Handling subscription.halted', {
      razorpaySubscriptionId: subscriptionData.id,
      webhookEventId,
    });

    const subscription = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: subscriptionData.id },
    });

    if (!subscription) {
      return 'Subscription not found in database';
    }

    // Update subscription to halted (using INACTIVE status as HALTED is not in enum)
    await prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'INACTIVE' as SubscriptionStatusType,
          autoRenew: false,
        },
      });

      // Link webhook
      await tx.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          subscriptionId: subscription.id,
          userId: subscription.userId,
        },
      });

      // Create audit log
      await tx.subscriptionAuditLog.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          action: 'PAUSED',
          actor: 'WEBHOOK',
          actorId: 'razorpay',
          previousState: { status: subscription.status },
          newState: { status: 'INACTIVE' },
          reason: 'Webhook: subscription.halted',
        },
      });
    });

    return `Subscription halted: ${subscription.id}`;
  }

  /**
   * Handle subscription.resumed event
   */
  private async handleSubscriptionResumed(
    payload: RazorpayWebhookPayload,
    webhookEventId: string
  ): Promise<string> {
    const subscriptionData = payload.payload.subscription?.entity;

    if (!subscriptionData) {
      throw new AppError('Missing subscription data', 400, 'MISSING_DATA');
    }

    logger.info('Handling subscription.resumed', {
      razorpaySubscriptionId: subscriptionData.id,
      webhookEventId,
    });

    const subscription = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: subscriptionData.id },
    });

    if (!subscription) {
      return 'Subscription not found in database';
    }

    // Update subscription to active
    await prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE' as SubscriptionStatusType,
          autoRenew: true,
          cancelledAt: null,
        },
      });

      // Ensure user is PRO
      await tx.user.update({
        where: { id: subscription.userId },
        data: {
          subscriptionTier: 'PRO' as SubscriptionTierType,
          subscriptionStatus: 'ACTIVE' as SubscriptionStatusType,
        },
      });

      // Link webhook
      await tx.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          subscriptionId: subscription.id,
          userId: subscription.userId,
        },
      });

      // Create audit log
      await tx.subscriptionAuditLog.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          action: 'RESUMED',
          actor: 'WEBHOOK',
          actorId: 'razorpay',
          previousState: { status: subscription.status },
          newState: { status: 'ACTIVE' },
          reason: 'Webhook: subscription.resumed',
        },
      });
    });

    return `Subscription resumed: ${subscription.id}`;
  }

  /**
   * Handle subscription.paused event
   */
  private async handleSubscriptionPaused(
    payload: RazorpayWebhookPayload,
    webhookEventId: string
  ): Promise<string> {
    const subscriptionData = payload.payload.subscription?.entity;

    if (!subscriptionData) {
      throw new AppError('Missing subscription data', 400, 'MISSING_DATA');
    }

    logger.info('Handling subscription.paused', {
      razorpaySubscriptionId: subscriptionData.id,
      webhookEventId,
    });

    const subscription = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: subscriptionData.id },
    });

    if (!subscription) {
      return 'Subscription not found in database';
    }

    // Update subscription to paused (using INACTIVE status and pausedAt field)
    await prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'INACTIVE' as SubscriptionStatusType,
          pausedAt: new Date(),
          autoRenew: false,
        },
      });

      // Link webhook
      await tx.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          subscriptionId: subscription.id,
          userId: subscription.userId,
        },
      });

      // Create audit log
      await tx.subscriptionAuditLog.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          action: 'PAUSED',
          actor: 'WEBHOOK',
          actorId: 'razorpay',
          previousState: { status: subscription.status },
          newState: { status: 'INACTIVE', pausedAt: new Date() },
          reason: 'Webhook: subscription.paused',
        },
      });
    });

    return `Subscription paused: ${subscription.id}`;
  }

  /**
   * Handle payment.failed event
   */
  private async handlePaymentFailed(
    payload: RazorpayWebhookPayload,
    webhookEventId: string
  ): Promise<string> {
    const paymentData = payload.payload.payment?.entity;

    if (!paymentData) {
      throw new AppError('Missing payment data', 400, 'MISSING_DATA');
    }

    logger.info('Handling payment.failed', {
      razorpayPaymentId: paymentData.id,
      webhookEventId,
    });

    // Try to find associated subscription
    // Note: This might not always be available
    const customerId = paymentData.customer_id;
    let subscription = null;

    if (customerId) {
      const user = await prisma.user.findUnique({
        where: { razorpayCustomerId: customerId },
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (user && user.subscriptions.length > 0) {
        subscription = user.subscriptions[0];
      }
    }

    // Record failed payment
    // Determine userId - required field
    let userId: string | null = null;
    if (subscription) {
      userId = subscription.userId;
    } else if (customerId) {
      // Try to find user by customer_id if no subscription found
      const user = await prisma.user.findUnique({
        where: { razorpayCustomerId: customerId },
        select: { id: true },
      });
      if (user) {
        userId = user.id;
      }
    }

    // Skip payment record if we can't identify the user
    // (userId is required in Payment model)
    if (!userId) {
      logger.warn('Cannot record failed payment: user not found', {
        razorpayPaymentId: paymentData.id,
        customerId,
      });
      return `Payment failed but user not found: ${paymentData.id}`;
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          userId,
          ...(subscription && { subscriptionId: subscription.id }),
          razorpayPaymentId: paymentData.id,
          razorpayOrderId: paymentData.order_id || '',
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: 'FAILED',
          method: paymentData.method?.toUpperCase() as any,
          email: paymentData.email,
          contact: paymentData.contact,
          errorReason: paymentData.error_description || paymentData.error_code || 'Unknown',
          metadata: {
            webhookEventId,
            errorCode: paymentData.error_code,
            errorDescription: paymentData.error_description,
          },
        },
      });

      // Link webhook
      await tx.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          paymentId: paymentData.id,
          ...(subscription && {
            subscriptionId: subscription.id,
            userId: subscription.userId,
          }),
        },
      });

      // Create audit log if subscription found
      if (subscription) {
        await tx.subscriptionAuditLog.create({
          data: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            paymentId: paymentData.id,
            action: 'PAYMENT_FAILED',
            actor: 'WEBHOOK',
            actorId: 'razorpay',
            reason: 'Webhook: payment.failed',
            metadata: {
              errorCode: paymentData.error_code,
              errorDescription: paymentData.error_description,
            },
          },
        });
      }
    });

    logger.info('Payment failed recorded via webhook', {
      paymentId: paymentData.id,
    });

    return `Payment failed recorded: ${paymentData.id}`;
  }

  /**
   * Handle refund.processed event
   */
  private async handleRefundProcessed(
    payload: RazorpayWebhookPayload,
    webhookEventId: string
  ): Promise<string> {
    const refundData = payload.payload.refund?.entity;

    if (!refundData) {
      throw new AppError('Missing refund data', 400, 'MISSING_DATA');
    }

    logger.info('Handling refund.processed', {
      razorpayRefundId: refundData.id,
      razorpayPaymentId: refundData.payment_id,
      webhookEventId,
    });

    // Find original payment
    const payment = await prisma.payment.findUnique({
      where: { razorpayPaymentId: refundData.payment_id },
      include: { subscription: true },
    });

    if (!payment) {
      logger.warn('Payment not found for refund webhook', {
        razorpayPaymentId: refundData.payment_id,
      });
      return 'Payment not found in database';
    }

    // Update payment with refund info
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          refundedAmount: refundData.amount,
          refundedAt: new Date(),
          status: refundData.amount >= payment.amount ? 'REFUNDED' : payment.status,
        },
      });

      // Link webhook
      await tx.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          paymentId: refundData.payment_id,
          ...(payment.subscription && {
            subscriptionId: payment.subscription.id,
            userId: payment.subscription.userId,
          }),
        },
      });

      // Create audit log
      if (payment.subscription) {
        await tx.subscriptionAuditLog.create({
          data: {
            userId: payment.subscription.userId,
            subscriptionId: payment.subscription.id,
            paymentId: refundData.payment_id,
            action: 'REFUND_ISSUED',
            actor: 'WEBHOOK',
            actorId: 'razorpay',
            reason: 'Webhook: refund.processed',
            metadata: {
              refundId: refundData.id,
              refundAmount: refundData.amount,
              originalAmount: payment.amount,
            },
          },
        });
      }
    });

    logger.info('Refund processed via webhook', {
      paymentId: payment.id,
      refundAmount: refundData.amount,
    });

    return `Refund processed: ${refundData.id}`;
  }
}
