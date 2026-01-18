import crypto from 'crypto';
import { env } from '../config/env.js';
import { logger } from './logger.js';

/**
 * Verify Razorpay payment signature
 * Critical for security - prevents payment tampering
 * 
 * @param razorpayPaymentId - Razorpay payment ID
 * @param razorpaySubscriptionId - Razorpay subscription ID
 * @param razorpaySignature - Signature from Razorpay
 * @returns true if signature is valid, false otherwise
 */
export function verifyPaymentSignature(
  razorpayPaymentId: string,
  razorpaySubscriptionId: string,
  razorpaySignature: string
): boolean {
  try {
    // Create expected signature
    // Format: payment_id|subscription_id (as per Razorpay documentation)
    const text = `${razorpayPaymentId}|${razorpaySubscriptionId}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpaySignature)
    );

    if (!isValid) {
      logger.warn('Payment signature verification failed', {
        razorpaySubscriptionId,
        razorpayPaymentId,
        providedSignature: razorpaySignature.substring(0, 10) + '...', // Log partial for debugging
      });
    }

    return isValid;
  } catch (error) {
    logger.error('Error verifying payment signature', {
      error: error instanceof Error ? error.message : 'Unknown error',
      razorpayPaymentId,
      razorpaySubscriptionId,
    });
    return false;
  }
}

/**
 * Verify Razorpay webhook signature
 * Used for webhook endpoint security
 * 
 * @param payload - Raw webhook payload (JSON string)
 * @param signature - Signature from webhook header
 * @returns true if signature is valid, false otherwise
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    // Use timing-safe comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );

    if (!isValid) {
      logger.warn('Webhook signature verification failed', {
        providedSignature: signature.substring(0, 10) + '...',
      });
    }

    return isValid;
  } catch (error) {
    logger.error('Error verifying webhook signature', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}
