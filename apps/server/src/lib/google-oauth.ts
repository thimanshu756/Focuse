import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { GoogleUserInfo } from '../types/auth.types.js';

/**
 * Google OAuth2 Client Instance
 * Used for verifying Google ID tokens from client-side authentication
 */
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID Token and extract user information
 * 
 * This function verifies the token signature with Google's servers
 * and extracts user profile information.
 * 
 * Security: Always verify tokens server-side, never trust client data
 * 
 * @param idToken - Google ID token received from client
 * @returns GoogleUserInfo - Verified user information
 * @throws AppError if token is invalid or verification fails
 */
export async function verifyGoogleToken(
  idToken: string
): Promise<GoogleUserInfo> {
  try {
    // Accept tokens from both web and Android clients
    const allowedAudiences = [env.GOOGLE_CLIENT_ID];
    if (env.GOOGLE_ANDROID_CLIENT_ID) {
      allowedAudiences.push(env.GOOGLE_ANDROID_CLIENT_ID);
    }

    // Verify the token with Google's servers
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: allowedAudiences,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new AppError(
        'Invalid Google token: no payload',
        401,
        'INVALID_GOOGLE_TOKEN'
      );
    }

    // Extract user information from the verified token
    const { sub, email, name, picture, email_verified } = payload;

    if (!email) {
      throw new AppError(
        'Google account email not found',
        401,
        'GOOGLE_EMAIL_NOT_FOUND'
      );
    }

    if (!sub) {
      throw new AppError(
        'Google account ID not found',
        401,
        'GOOGLE_ID_NOT_FOUND'
      );
    }

    logger.info('Google token verified', {
      googleId: sub,
      email,
      emailVerified: email_verified,
    });

    return {
      googleId: sub,
      email: email.toLowerCase().trim(),
      name: name || email.split('@')[0], // Fallback to email prefix if no name
      avatar: picture || undefined,
      emailVerified: email_verified || false,
    };
  } catch (error) {
    // Handle Google token verification errors
    if (error instanceof AppError) {
      throw error;
    }

    logger.error('Google token verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Generic error for all Google verification failures
    throw new AppError(
      'Failed to verify Google token. Please try again.',
      401,
      'GOOGLE_VERIFICATION_FAILED'
    );
  }
}

/**
 * Validate that a Google ID is properly formatted
 * Google IDs are numeric strings of 21 digits
 */
export function isValidGoogleId(googleId: string): boolean {
  return /^\d{21}$/.test(googleId);
}
