import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { AuthService } from '../services/auth.service.js';
import {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  LogoutInput,
  VerifyEmailInput,
  ResendVerificationInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
  ChangePasswordInput,
  GoogleAuthInput,
} from '../types/auth.types.js';

export class AuthController {
  private authService = new AuthService();

      register = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: RegisterInput = req.body;
      const result = await this.authService.register(data);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Account created. Please verify your email.',
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: LoginInput = req.body;
      const result = await this.authService.login(data);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: RefreshTokenInput = req.body;
      const tokens = await this.authService.refreshToken(data);
      res.json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: LogoutInput = req.body;
      await this.authService.logout(req.user!.id, data.refreshToken);
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data: VerifyEmailInput = req.body;
      await this.authService.verifyEmail(data);
      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  resendVerification = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data: ResendVerificationInput = req.body;
      await this.authService.resendVerification(data);
      res.json({
        success: true,
        message: 'Verification email sent',
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data: ForgotPasswordInput = req.body;
      await this.authService.forgotPassword(data);
      res.json({
        success: true,
        message: 'If that email exists, you\'ll receive a password reset link',
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data: ResetPasswordInput = req.body;
      await this.authService.resetPassword(data);
      res.json({
        success: true,
        message: 'Password reset successfully. Please login with your new password.',
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await this.authService.getCurrentUser(req.user!.id);
      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data: UpdateProfileInput = req.body;
      const user = await this.authService.updateProfile(req.user!.id, data);
      res.json({
        success: true,
        data: { user },
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data: ChangePasswordInput = req.body;
      await this.authService.changePassword(req.user!.id, data);
      res.json({
        success: true,
        message: 'Password changed successfully. Please login again on all devices.',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Google OAuth Authentication
   *
   * Handles Google Sign-In by verifying the ID token and either:
   * - Creating a new user account
   * - Linking Google to an existing email/password account
   * - Logging in an existing Google user
   *
   * POST /api/auth/google
   * Body: { idToken: string, timezone?: string }
   */
  googleAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: GoogleAuthInput = req.body;
      const result = await this.authService.googleAuth(data);

      // Customize message based on action taken
      let message = 'Successfully logged in with Google';
      if (result.isNewUser) {
        message = 'Account created successfully. Welcome!';
      } else if (result.isLinked) {
        message = 'Login Successfull';
      }

      res.json({
        success: true,
        data: {
          user: result.user,
          tokens: result.tokens,
        },
        meta: {
          isNewUser: result.isNewUser,
          isLinked: result.isLinked,
        },
        message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate Token (Mobile Payment Flow)
   *
   * Validates the access token and returns user information.
   * Used by web pricing page to verify tokens passed from mobile app.
   *
   * Security:
   * - Requires authentication (token verified by middleware)
   * - Returns minimal user data (only what's needed for pricing page)
   * - Calculates remaining token expiry for better UX
   *
   * GET /api/auth/validate-token
   * Headers: Authorization: Bearer <token>
   */
  validateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Extract raw token from Authorization header for expiry calculation
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1] || '';

      const result = await this.authService.validateToken(req.user!.id, token);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

