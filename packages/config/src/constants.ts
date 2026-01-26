/**
 * Application constants
 * @package @forest/config
 */

/** Timer duration presets in seconds */
export const TIMER_DURATIONS = {
  POMODORO: 25 * 60, // 25 minutes
  SHORT_BREAK: 5 * 60, // 5 minutes
  LONG_BREAK: 15 * 60, // 15 minutes
  MIN_DURATION: 60, // 1 minute
  MAX_DURATION: 120 * 60, // 2 hours
} as const;

/** Task validation limits */
export const TASK_LIMITS = {
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_TAGS: 10,
  MAX_ESTIMATED_MINUTES: 1440, // 24 hours
} as const;

/** API and rate limiting */
export const API_LIMITS = {
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 20,
  MAX_SYNC_OPERATIONS: 100,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
} as const;

/** AI usage limits by tier */
export const AI_LIMITS = {
  FREE: {
    REQUESTS_PER_MONTH: 10,
    TASK_BREAKDOWN_MAX: 5,
  },
  PRO: {
    REQUESTS_PER_MONTH: 500,
    TASK_BREAKDOWN_MAX: 50,
  },
  ENTERPRISE: {
    REQUESTS_PER_MONTH: null, // Unlimited
    TASK_BREAKDOWN_MAX: null,
  },
} as const;

/** Session tracking */
export const SESSION_LIMITS = {
  MIN_DURATION: 60, // 1 minute
  MAX_DURATION: 7200, // 2 hours
  MAX_PAUSE_DURATION: 300, // 5 minutes
  DEFAULT_BREAK_DURATION: 300, // 5 minutes
  APP_BACKGROUND_THRESHOLD: 30, // 30 seconds before failing
} as const;

/** Subscription plans */
export const SUBSCRIPTION_PLANS = {
  PRO_MONTHLY: {
    ID: 'pro_monthly',
    AMOUNT: 9500, // ₹95 in paise
    CURRENCY: 'INR',
    INTERVAL: 'monthly',
  },
  PRO_YEARLY: {
    ID: 'pro_yearly',
    AMOUNT: 60000, // ₹600 in paise (2 months free)
    CURRENCY: 'INR',
    INTERVAL: 'yearly',
    SAVINGS_PERCENTAGE: 17,
  },
} as const;

/** App version management */
export const APP_VERSION = {
  MIN_SUPPORTED: '1.0.0',
  LATEST: '1.0.0',
  FORCE_UPDATE_BELOW: '0.9.0', // Force update for versions below this
} as const;

/** API base URL (platform-specific) */
export const getApiBaseUrl = (): string => {
  // For web
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  }
  // For mobile/server
  return process.env.API_URL || 'http://localhost:8080';
};

export const API_BASE_URL = getApiBaseUrl();
