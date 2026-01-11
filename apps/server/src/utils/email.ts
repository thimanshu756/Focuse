import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { AppError } from './errors.js';

// Create reusable transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.GMAIL_USER,
      pass: env.GMAIL_APP_PASSWORD,
    },
  });
};

// Verify transporter connection
let transporter: nodemailer.Transporter | null = null;

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (!transporter) {
    transporter = createTransporter();
    try {
      await transporter.verify();
      logger.info('Email transporter verified successfully');
    } catch (error) {
      logger.error('Email transporter verification failed', { error });
      throw new AppError(
        'Email service configuration error',
        500,
        'EMAIL_CONFIG_ERROR'
      );
    }
  }
  return transporter;
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string
): Promise<void> => {
  try {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: `Forest Focus Timer <${env.GMAIL_USER}>`,
      to: email,
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌲 Welcome to Forest Focus Timer!</h1>
              </div>
              <div class="content">
                <h2>Hello ${name}!</h2>
                <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <p>If you didn't create an account, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Forest Focus Timer. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const emailTransporter = await getTransporter();
    const info = await emailTransporter.sendMail(mailOptions);

    logger.info('Verification email sent successfully', {
      to: email,
      messageId: info.messageId,
    });
  } catch (error) {
    logger.error('Failed to send verification email', {
      to: email,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // Don't throw error to avoid breaking user registration flow
    // Log it for monitoring instead
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<void> => {
  try {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: `Forest Focus Timer <${env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Password Reset Request</h1>
              </div>
              <div class="content">
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #f5576c;">${resetUrl}</p>
                <div class="warning">
                  <p><strong>⚠️ This link will expire in 1 hour.</strong></p>
                  <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Forest Focus Timer. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const emailTransporter = await getTransporter();
    const info = await emailTransporter.sendMail(mailOptions);

    logger.info('Password reset email sent successfully', {
      to: email,
      messageId: info.messageId,
    });
  } catch (error) {
    logger.error('Failed to send password reset email', {
      to: email,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // Don't throw error to avoid leaking if email exists
    // Log it for monitoring instead
  }
};
