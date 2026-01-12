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
} from '../types/auth.types.js';

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
        totalFocusTime: true,
        totalSessions: true,
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
        deletedAt: null,
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
    if (user && user.passwordHash) {
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

  private generateTokens(userId: string, email: string): TokensResponse {
    return {
      accessToken: generateAccessToken({ userId, email }),
      refreshToken: generateRefreshToken({ userId, email }),
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}

