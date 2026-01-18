import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    subscriptionTier: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new AppError('Invalid user', 401, 'UNAUTHORIZED');
    }

    req.user = {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid token', 401, 'UNAUTHORIZED'));
    }
  }
};

/**
 * Optional authentication middleware
 * Sets req.user if token is valid, but doesn't throw error if no token provided
 * Useful for public endpoints that show different data for authenticated users
 */
export const optionalAuthenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided - continue without setting user
      return next();
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          subscriptionTier: true,
          deletedAt: true,
        },
      });

      if (user && !user.deletedAt) {
        req.user = {
          id: user.id,
          email: user.email,
          subscriptionTier: user.subscriptionTier,
        };
      }
      // If user not found or deleted, continue without setting req.user
    } catch (error) {
      // Invalid token - continue without setting user (don't throw error)
      // This allows public access even with invalid tokens
    }

    next();
  } catch (error) {
    // Any unexpected error - continue without authentication
    next();
  }
};
