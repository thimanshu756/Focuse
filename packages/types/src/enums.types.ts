/**
 * Shared TypeScript enums matching Prisma schema definitions
 * @package @forest/types
 */

/** User subscription tiers */
export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

/** User subscription status */
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TRIAL = 'TRIAL',
  CANCELLED = 'CANCELLED',
  PAST_DUE = 'PAST_DUE',
}

/** Task status in lifecycle */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

/** Task priority levels */
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/** Focus session status */
export enum SessionStatus {
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/** Reason why a session failed */
export enum SessionFailReason {
  USER_GAVE_UP = 'USER_GAVE_UP',
  APP_BACKGROUNDED = 'APP_BACKGROUNDED',
  APP_CRASHED = 'APP_CRASHED',
  DISTRACTION_OPENED = 'DISTRACTION_OPENED',
  TIMEOUT = 'TIMEOUT',
}

/** AI request types */
export enum AIRequestType {
  TASK_BREAKDOWN = 'TASK_BREAKDOWN',
  SCHEDULE_SUGGEST = 'SCHEDULE_SUGGEST',
  POMODORO_OPTIMIZE = 'POMODORO_OPTIMIZE',
  INSIGHT_GENERATE = 'INSIGHT_GENERATE',
  TASK_ESTIMATE = 'TASK_ESTIMATE',
}

/** AI request processing status */
export enum AIRequestStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  RATE_LIMITED = 'RATE_LIMITED',
  TIMEOUT = 'TIMEOUT',
}

/** Subscription plan types */
export enum SubscriptionPlanType {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

/** Payment status */
export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
}

/** Payment methods */
export enum PaymentMethod {
  CARD = 'CARD',
  NETBANKING = 'NETBANKING',
  WALLET = 'WALLET',
  UPI = 'UPI',
  EMI = 'EMI',
  CARDLESS_EMI = 'CARDLESS_EMI',
  PAYLATER = 'PAYLATER',
}

/** Sync operation types */
export enum SyncOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/** Device platforms */
export enum DevicePlatform {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android',
}
