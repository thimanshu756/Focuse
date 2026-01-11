import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // AppError (known errors)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    });
  }

  // Prisma errors (check by error code property)
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string };
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Duplicate entry',
          code: 'DUPLICATE',
        },
      });
    }
    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Resource not found',
          code: 'NOT_FOUND',
        },
      });
    }
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        code: 'UNAUTHORIZED',
      },
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
};

