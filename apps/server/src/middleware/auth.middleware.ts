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

