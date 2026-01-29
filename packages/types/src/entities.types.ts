/**
 * Shared entity types matching Prisma models
 * @package @forest/types
 */

import type {
  SubscriptionTier,
  SubscriptionStatus,
  TaskStatus,
  TaskPriority,
  SessionStatus,
  SessionFailReason,
  DevicePlatform,
} from './enums.types';

/** User entity */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  passwordHash?: string | null;
  emailVerified: boolean;
  verificationToken?: string | null;
  googleId?: string | null;
  appleId?: string | null;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartDate?: Date | null;
  subscriptionEndDate?: Date | null;
  razorpayCustomerId?: string | null;
  timezone: string;
  userType?: string | null;
  preferredFocusTime?: string | null;
  onboardingCompleted: boolean;
  defaultSessionDuration: number;
  notificationsEnabled: boolean;
  totalFocusTime: number;
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate?: Date | null;
  googleCalendarToken?: string | null;
  googleCalendarRefreshToken?: string | null;
  outlookCalendarToken?: string | null;
  outlookCalendarRefreshToken?: string | null;
  aiRequestsThisMonth: number;
  aiRequestsResetDate: Date;
  lastSyncedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  deletedAt?: Date | null;
}

/** Task entity */
export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  estimatedMinutes?: number | null;
  actualMinutes: number;
  tagIds: string[];
  isAIGenerated: boolean;
  aiPrompt?: string | null;
  scheduledStartTime?: Date | null;
  scheduledEndTime?: Date | null;
  completedAt?: Date | null;
  clientId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/** Focus session entity */
export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string | null;
  duration: number;
  startTime: Date;
  endTime: Date;
  completedAt?: Date | null;
  pausedAt?: Date | null;
  failedAt?: Date | null;
  status: SessionStatus;
  progress: number;
  timeElapsed: number;
  pauseDuration: number;
  reason?: SessionFailReason | null;
  actualDuration?: number | null;
  breakDuration: number;
  breakTaken: boolean;
  platform?: string | null;
  deviceId?: string | null;
  clientId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Device entity */
export interface Device {
  id: string;
  userId: string;
  deviceId: string;
  platform: DevicePlatform | string;
  osVersion?: string | null;
  appVersion: string;
  pushToken?: string | null;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** User public profile (sanitized) */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  subscriptionTier: SubscriptionTier;
  totalFocusTime: number;
  totalSessions: number;
  currentStreak: number;
  createdAt: Date;
}
