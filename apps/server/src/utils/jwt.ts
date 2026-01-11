import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const generateVerificationToken = (email: string): string => {
  return jwt.sign({ email }, env.JWT_SECRET, { expiresIn: '24h' });
};

export const generatePasswordResetToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '1h' });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const verifyVerificationToken = (token: string): { email: string } => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as { email: string };
  } catch (error) {
    throw new Error('Invalid or expired verification token');
  }
};

export const verifyPasswordResetToken = (token: string): { userId: string } => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as { userId: string };
  } catch (error) {
    throw new Error('Invalid or expired reset token');
  }
};

