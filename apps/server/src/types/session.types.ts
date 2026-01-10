export interface CreateSessionInput {
  taskId?: string;
  duration: number; // minutes
  platform?: 'web' | 'ios' | 'android';
  deviceId?: string;
}

export interface PauseSessionInput {
  // No body, just params
}

export interface CompleteSessionInput {
  actualDuration?: number; // seconds, optional
}

export interface FailSessionInput {
  reason: 'USER_GAVE_UP' | 'APP_BACKGROUNDED' | 'APP_CRASHED' | 'DISTRACTION_OPENED' | 'TIMEOUT';
}

export interface SessionListFilters {
  status?: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  taskId?: string;
  page?: number;
  limit?: number;
}

export interface SessionStatsFilters {
  period?: 'today' | 'week' | 'month' | 'year' | 'all';
  startDate?: string; // ISO date
  endDate?: string; // ISO date
}

export interface SessionResponse {
  id: string;
  userId: string;
  taskId: string | null;
  duration: number; // seconds
  startTime: Date;
  endTime: Date;
  completedAt: Date | null;
  pausedAt: Date | null;
  failedAt: Date | null;
  status: string;
  progress: number; // 0-100
  timeElapsed: number; // seconds
  pauseDuration: number; // seconds
  reason: string | null;
  actualDuration: number | null;
  platform: string | null;
  deviceId: string | null;
  createdAt: Date;
  updatedAt: Date;
  task?: {
    id: string;
    title: string;
    status: string;
    priority: string;
  };
}

export interface SessionStatsResponse {
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  totalFocusTime: number; // seconds
  averageSessionDuration: number; // seconds
  completionRate: number; // percentage
  longestSession: number; // seconds
  currentStreak: number;
  bestFocusTime: number; // hour of day (0-23)
  dailyBreakdown: Array<{
    date: string;
    sessions: number;
    focusTime: number;
    completed: number;
  }>;
  taskBreakdown: Array<{
    taskId: string;
    taskTitle: string;
    sessions: number;
    focusTime: number;
  }>;
}

export interface BulkCompleteInput {
  sessionIds: string[];
}

export interface BulkCompleteResponse {
  completedCount: number;
}

