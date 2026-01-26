/**
 * API request/response types
 * @package @forest/types
 */

import type {
  User,
  UserProfile,
  Task,
  FocusSession,
  Device,
} from './entities.types';
import type { SyncOperation } from './enums.types';

// ============================================================================
// Common Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, any>;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

// ============================================================================
// Auth API Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface SignupResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// ============================================================================
// Task API Types
// ============================================================================

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string | Date;
  estimatedMinutes?: number;
  tagIds?: string[];
  scheduledStartTime?: string | Date;
  scheduledEndTime?: string | Date;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string | Date | null;
  estimatedMinutes?: number | null;
  tagIds?: string[];
  scheduledStartTime?: string | Date | null;
  scheduledEndTime?: string | Date | null;
}

export interface TaskListFilters {
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  page?: number;
  limit?: number;
}

export interface TaskListResponse {
  tasks: Task[];
  meta: PaginationMeta;
}

// ============================================================================
// Session API Types
// ============================================================================

export interface CreateSessionRequest {
  taskId?: string;
  duration: number;
  platform?: string;
  deviceId?: string;
}

export interface UpdateSessionRequest {
  status?: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  progress?: number;
  timeElapsed?: number;
  pauseDuration?: number;
  reason?:
    | 'USER_GAVE_UP'
    | 'APP_BACKGROUNDED'
    | 'APP_CRASHED'
    | 'DISTRACTION_OPENED'
    | 'TIMEOUT';
  actualDuration?: number;
  breakTaken?: boolean;
}

export interface SessionListFilters {
  status?: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  taskId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
}

export interface SessionListResponse {
  sessions: FocusSession[];
  meta: PaginationMeta;
}

export interface ForestDataResponse {
  totalTrees: number;
  completedSessions: number;
  totalFocusTime: number;
  sessions: FocusSession[];
}

// ============================================================================
// Sync API Types
// ============================================================================

export interface SyncOperationItem<T = any> {
  id: string;
  operation: SyncOperation;
  data?: T;
  timestamp: string | Date;
}

export interface SyncTasksRequest {
  deviceId: string;
  lastSyncedAt?: string | Date | null;
  operations: SyncOperationItem<Partial<Task>>[];
}

export interface SyncTasksResponse {
  synced: number;
  conflicts: number;
  mapping: Record<string, string>;
  serverTasks: Task[];
  lastSyncedAt: string;
}

export interface SyncSessionsRequest {
  deviceId: string;
  lastSyncedAt?: string | Date | null;
  operations: SyncOperationItem<Partial<FocusSession>>[];
}

export interface SyncSessionsResponse {
  synced: number;
  conflicts: number;
  mapping: Record<string, string>;
  serverSessions: FocusSession[];
  lastSyncedAt: string;
}

// ============================================================================
// Device API Types
// ============================================================================

export interface RegisterDeviceRequest {
  deviceId: string;
  platform: 'web' | 'ios' | 'android';
  osVersion?: string;
  appVersion: string;
  pushToken?: string;
}

export interface RegisterDeviceResponse {
  id: string;
  registered: boolean;
}

export interface UpdateDeviceRequest {
  pushToken?: string;
  osVersion?: string;
  appVersion?: string;
}

// ============================================================================
// Health API Types
// ============================================================================

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  minAppVersion: string;
  latestAppVersion: string;
  forceUpdate: boolean;
  message?: string;
}

// ============================================================================
// Insights API Types
// ============================================================================

export interface DailyStatsResponse {
  date: string;
  totalFocusTime: number;
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  tasksCompleted: number;
  morningFocusTime: number;
  afternoonFocusTime: number;
  eveningFocusTime: number;
  nightFocusTime: number;
}

export interface WeeklyInsightResponse {
  weekStart: string;
  weekEnd: string;
  narrative: string;
  insights: Array<{
    type: string;
    message: string;
    confidence: number;
  }>;
  recommendations: Array<{
    action: string;
    reason: string;
    impact: string;
  }>;
  nextWeekPlan: Array<{
    day: string;
    suggestion: string;
  }>;
  oneLeverToPull: string;
  weeklyStats: {
    totalFocusTime: number;
    totalSessions: number;
    completedSessions: number;
    failedSessions: number;
  };
}
