import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { AppError } from '../utils/errors.js';

export const requireSubscription = (...allowedTiers: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    if (!allowedTiers.includes(req.user.subscriptionTier)) {
      throw new AppError(
        'Upgrade to Pro subscription required',
        403,
        'SUBSCRIPTION_REQUIRED'
      );
    }

    next();
  };
};

