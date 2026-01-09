import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { AuthRequest } from './auth.middleware.js';

export const createRateLimiter = (options: {
  max: number;
  windowMs: number;
  message?: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise use IP
      const authReq = req as AuthRequest;
      return authReq.user?.id || req.ip || 'unknown';
    },
    handler: (req: Request, res: Response, next: NextFunction) => {
      next(
        new AppError(
          options.message || 'Too many requests',
          429,
          'RATE_LIMIT_EXCEEDED'
        )
      );
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Preset rate limiters
export const rateLimiters = {
  auth: createRateLimiter({
    max: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many authentication attempts',
  }),
  verification: createRateLimiter({
    max: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many verification requests',
  }),
  passwordReset: createRateLimiter({
    max: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many password reset requests',
  }),
  standard: createRateLimiter({
    max: 100,
    windowMs: 60 * 1000, // 1 minute
  }),
};

