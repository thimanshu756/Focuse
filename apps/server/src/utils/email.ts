import { logger } from './logger.js';

// For now, just log email content instead of actually sending
export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  const emailContent = {
    to: email,
    subject: 'Verify your email address',
    html: `
      <h1>Welcome to Forest Focus Timer, ${name}!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `,
  };

  logger.info('Verification email (logged, not sent)', {
    to: email,
    subject: emailContent.subject,
    url: verificationUrl,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  const emailContent = {
    to: email,
    subject: 'Reset your password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    `,
  };

  logger.info('Password reset email (logged, not sent)', {
    to: email,
    subject: emailContent.subject,
    url: resetUrl,
  });
};

