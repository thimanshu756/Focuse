import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { rateLimiters } from '../middleware/rate-limiter.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';

const router: Router = Router();
const controller = new AuthController();

// POST /api/auth/register
router.post(
  '/register',
  rateLimiters.auth,
  validateRequest(registerSchema),
  controller.register
);

// POST /api/auth/login
router.post(
  '/login',
  rateLimiters.auth,
  validateRequest(loginSchema),
  controller.login
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  rateLimiters.standard,
  validateRequest(refreshTokenSchema),
  controller.refresh
);

// POST /api/auth/logout
router.post(
  '/logout',
  authenticate,
  rateLimiters.standard,
  validateRequest(logoutSchema),
  controller.logout
);

// POST /api/auth/verify-email
router.post(
  '/verify-email',
  rateLimiters.standard,
  validateRequest(verifyEmailSchema),
  controller.verifyEmail
);

// POST /api/auth/resend-verification
router.post(
  '/resend-verification',
  rateLimiters.verification,
  validateRequest(resendVerificationSchema),
  controller.resendVerification
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  rateLimiters.passwordReset,
  validateRequest(forgotPasswordSchema),
  controller.forgotPassword
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  rateLimiters.standard,
  validateRequest(resetPasswordSchema),
  controller.resetPassword
);

// GET /api/auth/me
router.get('/me', authenticate, rateLimiters.standard, controller.getMe);

export default router;

