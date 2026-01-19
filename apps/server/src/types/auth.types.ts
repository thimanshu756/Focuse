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
  userType?: string | null;
  preferredFocusTime?: string | null;
  onboardingCompleted?: boolean;
  currentStreak: number;
  longestStreak: number;
  totalFocusTime: number;
  totalSessions: number;
  completedSessions: number;
  createdAt: Date;
}

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UpdateProfileInput {
  name?: string;
  timezone?: string;
  avatar?: string;
  userType?: 'student' | 'professional' | 'freelancer';
  preferredFocusTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  onboardingCompleted?: boolean;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface GoogleAuthInput {
  idToken: string; // Google ID token from client
  timezone?: string;
}

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
}
