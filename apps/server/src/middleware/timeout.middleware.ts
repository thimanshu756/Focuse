/**
 * Timeout Middleware
 * Sets custom timeout for specific routes that require longer processing time
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Creates a timeout middleware with custom timeout duration
 * @param timeoutMs - Timeout in milliseconds
 */
export const createTimeoutMiddleware = (timeoutMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const path = req.path;
    
    logger.debug(`Setting timeout for ${req.method} ${path}`, {
      timeoutMs,
      requestId: (req as any).id,
    });
    
    // CRITICAL: Set timeouts on BOTH the socket AND the connection
    // to prevent premature termination
    
    // 1. Set socket timeout (prevents socket from closing)
    if (req.socket) {
      req.socket.setTimeout(timeoutMs);
      logger.debug(`Socket timeout set to ${timeoutMs}ms for ${path}`);
    }
    
    // 2. Set connection timeout (prevents connection from closing)
    if (req.connection) {
      req.connection.setTimeout(timeoutMs);
      logger.debug(`Connection timeout set to ${timeoutMs}ms for ${path}`);
    }
    
    // 3. Create a manual timeout for the request with proper cleanup
    let timeoutId: NodeJS.Timeout | null = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      logger.warn(`Request timeout triggered for ${req.method} ${path}`, {
        timeoutMs,
        elapsedMs: elapsed,
        requestId: (req as any).id,
      });
      
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          error: {
            message: 'Request timeout - the operation took too long to complete',
            code: 'REQUEST_TIMEOUT',
          },
        });
      }
    }, timeoutMs);

    // 4. Clear timeout when response is sent
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any, cb?: any) {
      const elapsed = Date.now() - startTime;
      
      // Clear the manual timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
        logger.debug(`Timeout cleared for ${req.method} ${path}`, {
          elapsedMs: elapsed,
          requestId: (req as any).id,
        });
      }
      
      // Reset socket timeouts to default (0 = no timeout)
      if (req.socket) {
        req.socket.setTimeout(0);
      }
      if (req.connection) {
        req.connection.setTimeout(0);
      }
      return originalEnd.call(this, chunk, encoding, cb);
    };
    
    // Also handle response close/finish events
    res.on('close', () => {
      if (timeoutId) {
        const elapsed = Date.now() - startTime;
        logger.debug(`Response closed, clearing timeout for ${req.method} ${path}`, {
          elapsedMs: elapsed,
          requestId: (req as any).id,
        });
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    });

    next();
  };
};

/**
 * Extended timeout for AI operations (120 seconds)
 * AI requests can take longer due to model processing time
 * Increased from 90s to 120s to match server timeout configuration
 */
export const aiTimeout = createTimeoutMiddleware(120 * 1000); // 120 seconds
