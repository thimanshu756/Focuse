import { Request, Response, NextFunction } from 'express';
import { WebhookService } from '../services/webhook.service.js';
import { logger } from '../utils/logger.js';

export class WebhookController {
  private webhookService = new WebhookService();

  /**
   * POST /api/v1/webhooks/razorpay
   * Handle incoming Razorpay webhooks
   * NO AUTHENTICATION - webhooks come from Razorpay, not users
   * Verifies signature for security
   */
  handleRazorpayWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Get signature from headers
      const signature = req.headers['x-razorpay-signature'] as string;

      if (!signature) {
        logger.warn('Webhook received without signature', {
          ip: req.ip,
          userAgent: req.get('user-agent'),
        });
        res.status(401).json({
          success: false,
          error: {
            message: 'Missing webhook signature',
            code: 'MISSING_SIGNATURE',
          },
        });
        return;
      }

      // Get raw body (needed for signature verification)
      // @ts-ignore - rawBody is added by middleware
      const rawBody = req.rawBody as string;

      if (!rawBody) {
        logger.error('Raw body not available for webhook', {
          ip: req.ip,
        });
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid request body',
            code: 'INVALID_BODY',
          },
        });
        return;
      }

      logger.info('Webhook received', {
        signature: signature.substring(0, 10) + '...',
        bodyLength: rawBody.length,
        ip: req.ip,
      });

      // Process webhook
      const result = await this.webhookService.processWebhook(
        rawBody,
        signature
      );

      // Return 200 OK immediately (Razorpay expects quick response)
      res.status(200).json({
        success: true,
        data: result,
      });

      logger.info('Webhook processed successfully', {
        eventType: result.eventType,
        eventId: result.eventId,
      });
    } catch (error: any) {
      // Log error but still return 200 to prevent Razorpay retries
      // We've already stored the webhook event, so we can retry manually if needed
      logger.error('Webhook processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        code: error?.code,
        ip: req.ip,
      });

      // For signature verification failures, return 401
      if (error?.code === 'INVALID_WEBHOOK_SIGNATURE') {
        res.status(401).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
          },
        });
        return;
      }

      // For other errors, return 200 to prevent retries
      // (we've logged the error and can investigate manually)
      res.status(200).json({
        success: false,
        error: {
          message: 'Webhook received but processing failed',
          code: 'PROCESSING_FAILED',
        },
      });
    }
  };
}
