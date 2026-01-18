import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Razorpay client instance
 * Note: Razorpay SDK needs to be installed: pnpm add razorpay @types/razorpay
 */
let razorpayInstance: Razorpay | null = null;

export const getRazorpayClient = (): Razorpay => {
  if (!razorpayInstance) {
    try {
      razorpayInstance = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
      });

      logger.info('Razorpay client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Razorpay client', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to initialize Razorpay client');
    }
  }

  return razorpayInstance;
};

// Export singleton instance
export const razorpay = getRazorpayClient();
