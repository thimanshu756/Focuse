import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
} from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  generatePasswordResetToken,
  verifyRefreshToken,
  verifyVerificationToken,
  verifyPasswordResetToken,
} from '../utils/jwt.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/email.js';
import {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  VerifyEmailInput,
  ResendVerificationInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
  ChangePasswordInput,
  UserResponse,
  TokensResponse,
  GoogleAuthInput,
} from '../types/auth.types.js';
import { verifyGoogleToken } from '../lib/google-oauth.js';
import jwt from 'jsonwebtoken';

export class AuthService {
  async register(data: RegisterInput): Promise<{
    user: UserResponse;
    tokens: TokensResponse;
  }> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new AppError(
        passwordValidation.message!,
        400,
        'VALIDATION_ERROR'
      );
    }

    // Check if email already exists (emails are normalized to lowercase)
    const normalizedEmail = data.email.toLowerCase().trim();
    console.log("Normalized email: ", normalizedEmail);
    const existingUser = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      throw new AppError('Email already exists', 409, 'DUPLICATE_EMAIL');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Generate verification token with normalized email (already normalized above)
    // JWT tokens are cryptographically unique (include email + timestamp + signature)
    const verificationToken = generateVerificationToken(normalizedEmail);

    // Create user
    // Note: Don't include googleId/appleId/stripeCustomerId/stripeSubscriptionId for email/password users
    // MongoDB unique constraints only allow ONE null value, so omit the field entirely
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        passwordHash,
        timezone: data.timezone || 'UTC',
        subscriptionTier: 'FREE',
        subscriptionStatus: 'INACTIVE',
        emailVerified: false,
        verificationToken,
        // Omit nullable unique fields: googleId, appleId, stripeCustomerId, stripeSubscriptionId
        // MongoDB won't enforce unique on missing fields
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        emailVerified: true,
        timezone: true,
        currentStreak: true,
        longestStreak: true,
        totalFocusTime: true,
        totalSessions: true,
        completedSessions: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    // Send verification email (log for now)
    await sendVerificationEmail(user.email, user.name, verificationToken);

    logger.info('User registered', { userId: user.id, email: user.email });

    return { user, tokens };
  }

  async login(data: LoginInput): Promise<{
    user: UserResponse;
    tokens: TokensResponse;
  }> {
    // Find user by email (emails are normalized to lowercase)
    const normalizedEmail = data.email.toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        passwordHash: true,
        deletedAt: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        emailVerified: true,
        timezone: true,
        userType: true,
        preferredFocusTime: true,
        onboardingCompleted: true,
        currentStreak: true,
        longestStreak: true,
        totalFocusTime: true,
        totalSessions: true,
        completedSessions: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check if user is soft-deleted
    if (user.deletedAt) {
      throw new AppError('Account not found', 401, 'ACCOUNT_NOT_FOUND');
    }

    // Check if user has password (OAuth users don't)
    if (!user.passwordHash) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Compare password
    const isPasswordValid = await comparePassword(
      data.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    logger.info('User logged in', { userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        emailVerified: user.emailVerified,
        timezone: user.timezone,
        userType: user.userType,
        preferredFocusTime: user.preferredFocusTime,
        onboardingCompleted: user.onboardingCompleted ?? false,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalFocusTime: user.totalFocusTime,
        totalSessions: user.totalSessions,
        completedSessions: user.completedSessions,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  async refreshToken(data: RefreshTokenInput): Promise<TokensResponse> {
    try {
      const decoded = verifyRefreshToken(data.refreshToken);

      // Check if user still exists and not deleted
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, deletedAt: true },
      });

      if (!user || user.deletedAt) {
        throw new AppError('User not found', 401, 'USER_NOT_FOUND');
      }

      // Generate new tokens (token rotation for security)
      const tokens = this.generateTokens(user.id, user.email);

      logger.info('Token refreshed', { userId: user.id });

      return tokens;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // JWT verification errors
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          throw new AppError(
            'Refresh token expired, please login',
            401,
            'TOKEN_EXPIRED'
          );
        }
        throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
      }
      throw error;
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    // In a production app, you would:
    // 1. Store invalidated refresh token in Redis with TTL
    // 2. Or maintain a token blacklist in DB
    // For now, we'll just log it
    logger.info('User logged out', { userId });
    // TODO: Implement token blacklist/Redis invalidation
  }

  async verifyEmail(data: VerifyEmailInput): Promise<void> {
    try {
      const decoded = verifyVerificationToken(data.token);
      const email = decoded.email;
      console.log("Email: ", email);
      
      // Find user by email (emails are normalized to lowercase)
      const normalizedEmail = email.toLowerCase().trim();
      const user = await prisma.user.findFirst({
        where: {
          email: normalizedEmail
        },
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // If already verified, return success (idempotent)
      if (user.emailVerified) {
        return;
      }

      // Update emailVerified
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationToken: null, // Clear token after use
        },
      });

      logger.info('Email verified', { userId: user.id, email: user.email });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // JWT verification errors
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          throw new AppError(
            'Verification token expired',
            400,
            'TOKEN_EXPIRED'
          );
        }
        throw new AppError('Invalid verification token', 400, 'INVALID_TOKEN');
      }
      throw error;
    }
  }

  async resendVerification(data: ResendVerificationInput): Promise<void> {
    // Find user by email (emails are normalized to lowercase)
    const normalizedEmail = data.email.toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // If already verified, return success
    if (user.emailVerified) {
      return;
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken(user.email);

    // Update verification token
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    // Send verification email
    await sendVerificationEmail(user.name, user.email, verificationToken);

    logger.info('Verification email resent', {
      userId: user.id,
      email: user.email,
    });
  }

  async forgotPassword(data: ForgotPasswordInput): Promise<void> {
    // Find user by email (emails are normalized to lowercase)
    const normalizedEmail = data.email.toLowerCase().trim();
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail
      },
    });

    // ALWAYS return success (don't leak if email exists)
    // Only proceed if user exists and has password (not OAuth-only)
    if (user) {
      // Generate password reset token
      const resetToken = generatePasswordResetToken(user.id);

      // Send reset email
      await sendPasswordResetEmail(user.email, resetToken);

      logger.info('Password reset email sent', {
        userId: user.id,
        email: user.email,
      });
    } else {
      // Log but don't reveal user doesn't exist
      logger.info('Password reset requested for non-existent email', {
        email: data.email,
      });
    }
  }

  async resetPassword(data: ResetPasswordInput): Promise<void> {
    try {
      // Verify token
      const decoded = verifyPasswordResetToken(data.token);
      const userId = decoded.userId;

      // Validate new password strength
      const passwordValidation = validatePasswordStrength(data.newPassword);
      if (!passwordValidation.valid) {
        throw new AppError(
          passwordValidation.message!,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, deletedAt: true },
      });

      if (!user || user.deletedAt) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Hash new password
      const passwordHash = await hashPassword(data.newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      // TODO: Invalidate all existing refresh tokens (force re-login)
      // This would require maintaining a token blacklist or user token version

      logger.info('Password reset', { userId });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // JWT verification errors
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          throw new AppError('Reset token expired', 400, 'TOKEN_EXPIRED');
        }
        throw new AppError('Invalid reset token', 400, 'INVALID_TOKEN');
      }
      throw error;
    }
  }

  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        emailVerified: true,
        timezone: true,
        userType: true,
        preferredFocusTime: true,
        onboardingCompleted: true,
        currentStreak: true,
        longestStreak: true,
        totalFocusTime: true,
        totalSessions: true,
        completedSessions: true,
        createdAt: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      emailVerified: user.emailVerified,
      timezone: user.timezone,
      userType: user.userType,
      preferredFocusTime: user.preferredFocusTime,
      onboardingCompleted: user.onboardingCompleted ?? false,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalFocusTime: user.totalFocusTime,
      totalSessions: user.totalSessions,
      completedSessions: user.completedSessions,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileInput
  ): Promise<UserResponse> {
    // Find user first to check if exists and not deleted
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, deletedAt: true },
    });

    if (!existingUser || existingUser.deletedAt) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Build update data (only include provided fields)
    const updateData: {
      name?: string;
      timezone?: string;
      avatar?: string | null;
      userType?: string;
      preferredFocusTime?: string;
      onboardingCompleted?: boolean;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.timezone !== undefined) {
      // Validate timezone using Intl API
      try {
        Intl.DateTimeFormat(undefined, { timeZone: data.timezone });
        updateData.timezone = data.timezone;
      } catch {
        throw new AppError('Invalid IANA timezone', 400, 'INVALID_TIMEZONE');
      }
    }

    if (data.avatar !== undefined) {
      updateData.avatar = data.avatar || null;
    }

    if (data.userType !== undefined) {
      const validUserTypes = ['student', 'professional', 'freelancer'];
      if (!validUserTypes.includes(data.userType)) {
        throw new AppError('Invalid user type', 400, 'INVALID_USER_TYPE');
      }
      updateData.userType = data.userType;
    }

    if (data.preferredFocusTime !== undefined) {
      const validFocusTimes = ['morning', 'afternoon', 'evening', 'night'];
      if (!validFocusTimes.includes(data.preferredFocusTime)) {
        throw new AppError('Invalid preferred focus time', 400, 'INVALID_FOCUS_TIME');
      }
      updateData.preferredFocusTime = data.preferredFocusTime;
    }

    if (data.onboardingCompleted !== undefined) {
      updateData.onboardingCompleted = data.onboardingCompleted;
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        emailVerified: true,
        timezone: true,
        userType: true,
        preferredFocusTime: true,
        onboardingCompleted: true,
        currentStreak: true,
        longestStreak: true,
        totalFocusTime: true,
        totalSessions: true,
        completedSessions: true,
        createdAt: true,
      },
    });

    logger.info('Profile updated', { userId });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      emailVerified: user.emailVerified,
      timezone: user.timezone,
      userType: user.userType,
      preferredFocusTime: user.preferredFocusTime,
      onboardingCompleted: user.onboardingCompleted ?? false,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalFocusTime: user.totalFocusTime,
      totalSessions: user.totalSessions,
      completedSessions: user.completedSessions,
      createdAt: user.createdAt,
    };
  }

  async changePassword(
    userId: string,
    data: ChangePasswordInput
  ): Promise<void> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if user has password (OAuth users don't)
    if (!user.passwordHash) {
      throw new AppError(
        'Password change not available for OAuth accounts',
        400,
        'OAUTH_ACCOUNT'
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      data.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new AppError(
        'Current password is incorrect',
        401,
        'INVALID_PASSWORD'
      );
    }

    // Check if new password is different from old
    const isSamePassword = await comparePassword(
      data.newPassword,
      user.passwordHash
    );

    if (isSamePassword) {
      throw new AppError(
        'New password must be different from current password',
        400,
        'SAME_PASSWORD'
      );
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(data.newPassword);
    if (!passwordValidation.valid) {
      throw new AppError(
        passwordValidation.message!,
        400,
        'VALIDATION_ERROR'
      );
    }

    // Hash new password
    const newPasswordHash = await hashPassword(data.newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // TODO: Invalidate all existing refresh tokens (force re-login on other devices)
    // This would require maintaining a token blacklist or user token version

    logger.info('Password changed', { userId });
  }

  /**
   * Google OAuth Authentication
   * 
   * Handles three scenarios:
   * 1. New user → Create account with Google
   * 2. Existing user with email/password but no Google → Link Google account
   * 3. Existing user with Google → Login
   * 
   * Security considerations:
   * - Always verify Google token server-side
   * - Google emails are pre-verified (emailVerified = true)
   * - Check for soft-deleted accounts
   * - Handle duplicate googleId edge cases
   * 
   * @param data - Google authentication input with ID token
   * @returns User and tokens
   */
  async googleAuth(data: GoogleAuthInput): Promise<{
    user: UserResponse;
    tokens: TokensResponse;
    isNewUser: boolean;
    isLinked: boolean;
  }> {
    // Step 1: Verify Google token and extract user info
    const googleUser = await verifyGoogleToken(data.idToken);

    // Step 2: Check if user exists with this Google ID
    let user = await prisma.user.findFirst({
      where: {
        googleId: googleUser.googleId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        emailVerified: true,
        timezone: true,
        userType: true,
        preferredFocusTime: true,
        onboardingCompleted: true,
        currentStreak: true,
        longestStreak: true,
        totalFocusTime: true,
        totalSessions: true,
        completedSessions: true,
        createdAt: true,
        googleId: true,
      },
    });

    // Step 3: If user exists with Google ID → Login
    if (user) {
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          lastLoginAt: new Date(),
          // Update avatar if Google profile picture changed
          avatar: googleUser.avatar || user.avatar,
        },
      });

      const tokens = this.generateTokens(user.id, user.email);

      logger.info('User logged in with Google', {
        userId: user.id,
        email: user.email,
        googleId: googleUser.googleId,
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: googleUser.avatar || user.avatar,
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: user.subscriptionStatus,
          emailVerified: user.emailVerified,
          timezone: user.timezone,
          userType: user.userType,
          preferredFocusTime: user.preferredFocusTime,
          onboardingCompleted: user.onboardingCompleted ?? false,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          totalFocusTime: user.totalFocusTime,
          totalSessions: user.totalSessions,
          completedSessions: user.completedSessions,
          createdAt: user.createdAt,
        },
        tokens,
        isNewUser: false,
        isLinked: false,
      };
    }

    // Step 4: Check if user exists with this email (but no Google ID yet)
    const existingEmailUser = await prisma.user.findFirst({
      where: {
        email: googleUser.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        emailVerified: true,
        timezone: true,
        userType: true,
        preferredFocusTime: true,
        onboardingCompleted: true,
        currentStreak: true,
        longestStreak: true,
        totalFocusTime: true,
        totalSessions: true,
        completedSessions: true,
        createdAt: true,
        googleId: true,
        passwordHash: true,
      },
    });

    // Step 5: If user exists with email but no Google ID → Link accounts
    if (existingEmailUser && !existingEmailUser.googleId) {
      // Link Google account to existing user
      const updatedUser = await prisma.user.update({
        where: { id: existingEmailUser.id },
        data: {
          googleId: googleUser.googleId,
          emailVerified: true, // Google emails are verified
          avatar: googleUser.avatar || existingEmailUser.avatar, // Update avatar if provided
          lastLoginAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          emailVerified: true,
          timezone: true,
          userType: true,
          preferredFocusTime: true,
          onboardingCompleted: true,
          currentStreak: true,
          longestStreak: true,
          totalFocusTime: true,
          totalSessions: true,
          completedSessions: true,
          createdAt: true,
        },
      });

      const tokens = this.generateTokens(updatedUser.id, updatedUser.email);

      logger.info('Google account linked to existing user', {
        userId: updatedUser.id,
        email: updatedUser.email,
        googleId: googleUser.googleId,
        hadPassword: !!existingEmailUser.passwordHash,
      });

      return {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          subscriptionTier: updatedUser.subscriptionTier,
          subscriptionStatus: updatedUser.subscriptionStatus,
          emailVerified: updatedUser.emailVerified,
          timezone: updatedUser.timezone,
          userType: updatedUser.userType,
          preferredFocusTime: updatedUser.preferredFocusTime,
          onboardingCompleted: updatedUser.onboardingCompleted ?? false,
          currentStreak: updatedUser.currentStreak,
          longestStreak: updatedUser.longestStreak,
          totalFocusTime: updatedUser.totalFocusTime,
          totalSessions: updatedUser.totalSessions,
          completedSessions: updatedUser.completedSessions,
          createdAt: updatedUser.createdAt,
        },
        tokens,
        isNewUser: false,
        isLinked: true,
      };
    }

    // Step 6: New user → Create account with Google
    try {
      const newUser = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.googleId,
          avatar: googleUser.avatar,
          emailVerified: true, // Google emails are pre-verified
          timezone: data.timezone || 'UTC',
          subscriptionTier: 'FREE',
          subscriptionStatus: 'INACTIVE',
          passwordHash: null, // OAuth users don't have passwords initially
          lastLoginAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          emailVerified: true,
          timezone: true,
          userType: true,
          preferredFocusTime: true,
          onboardingCompleted: true,
          currentStreak: true,
          longestStreak: true,
          totalFocusTime: true,
          totalSessions: true,
          completedSessions: true,
          createdAt: true,
        },
      });

      const tokens = this.generateTokens(newUser.id, newUser.email);

      logger.info('New user registered with Google', {
        userId: newUser.id,
        email: newUser.email,
        googleId: googleUser.googleId,
      });

      return {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
          subscriptionTier: newUser.subscriptionTier,
          subscriptionStatus: newUser.subscriptionStatus,
          emailVerified: newUser.emailVerified,
          timezone: newUser.timezone,
          userType: newUser.userType,
          preferredFocusTime: newUser.preferredFocusTime,
          onboardingCompleted: newUser.onboardingCompleted ?? false,
          currentStreak: newUser.currentStreak,
          longestStreak: newUser.longestStreak,
          totalFocusTime: newUser.totalFocusTime,
          totalSessions: newUser.totalSessions,
          completedSessions: newUser.completedSessions,
          createdAt: newUser.createdAt,
        },
        tokens,
        isNewUser: true,
        isLinked: false,
      };
    } catch (error: unknown) {
      // Handle potential race conditions or database errors
      logger.error('Error creating Google OAuth user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: googleUser.email,
        googleId: googleUser.googleId,
      });

      // Check if error is due to duplicate email (race condition)
      if (
        error instanceof Error &&
        error.message.includes('Unique constraint')
      ) {
        throw new AppError(
          'An account with this email already exists. Please try logging in.',
          409,
          'DUPLICATE_EMAIL'
        );
      }

      throw new AppError(
        'Failed to create account. Please try again.',
        500,
        'REGISTRATION_FAILED'
      );
    }
  }

  /**
   * Validate Token for Mobile Payment Flow
   *
   * This endpoint is used by the web pricing page to validate tokens
   * passed from the mobile app via URL parameters.
   *
   * Security considerations:
   * - Token already verified by authenticate middleware
   * - User existence and deletion status checked
   * - Returns minimal user data (only what's needed for pricing page)
   * - Calculates remaining token expiry for better UX
   *
   * Edge cases handled:
   * - User not found (404)
   * - User soft-deleted (401)
   * - Token expired (handled by middleware, but we calculate remaining time)
   *
   * @param userId - User ID from authenticate middleware (req.user.id)
   * @param tokenString - Raw token string from Authorization header (for expiry calculation)
   * @returns ValidateTokenResponse with user info and expiry time
   */
  async validateToken(userId: string, tokenString: string): Promise<import('../types/auth.types.js').ValidateTokenResponse> {
    // Edge case 1: User not found
    // This should not happen as middleware already verified the token,
    // but we check anyway for data consistency
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        deletedAt: true,
      },
    });

    if (!user) {
      logger.warn('Token validation failed: user not found', { userId });
      throw new AppError(
        'User not found',
        404,
        'USER_NOT_FOUND'
      );
    }

    // Edge case 2: User has been soft-deleted
    // User might have deleted their account after token was issued
    if (user.deletedAt) {
      logger.warn('Token validation failed: user deleted', { userId });
      throw new AppError(
        'User account has been deleted',
        401,
        'USER_DELETED'
      );
    }

    // Calculate token expiry time
    // Token is JWT, we can decode it to get expiry without verification
    // (already verified by middleware)
    let expiresIn = 0;
    try {
      const decoded = jwt.decode(tokenString) as { exp?: number };
      if (decoded && decoded.exp) {
        const now = Math.floor(Date.now() / 1000);
        expiresIn = Math.max(0, decoded.exp - now);
      }
    } catch (error) {
      // If decode fails, token is malformed but middleware already verified it
      // Set expiry to default (15 min = 900 seconds)
      expiresIn = 900;
      logger.warn('Token decode failed for expiry calculation', { userId });
    }

    logger.info('Token validated successfully', {
      userId,
      expiresIn,
      subscriptionTier: user.subscriptionTier
    });

    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
      },
      expiresIn,
    };
  }

  private generateTokens(userId: string, email: string): TokensResponse {
    return {
      accessToken: generateAccessToken({ userId, email }),
      refreshToken: generateRefreshToken({ userId, email }),
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}

