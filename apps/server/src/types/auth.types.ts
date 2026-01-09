export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface LogoutInput {
  refreshToken: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface ResendVerificationInput {
  email: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  subscriptionTier: string;
  subscriptionStatus: string;
  emailVerified: boolean;
  timezone: string;
  currentStreak: number;
  totalFocusTime: number;
  totalSessions: number;
  createdAt: Date;
}

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

