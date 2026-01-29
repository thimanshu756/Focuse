/**
 * Session Types
 * Type definitions for focus session functionality
 */

export type SessionStatus = 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
export type TreeType = 'basic' | 'premium' | 'elite';

export interface Session {
  id: string;
  taskId?: string;
  task?: {
    title: string;
    description?: string;
  };
  duration: number; // Total duration in seconds
  timeElapsed: number; // Time elapsed in seconds
  actualMinutes?: number;
  status: SessionStatus;
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  progress: number; // 0-100
  treeType?: TreeType;
  createdAt: string;
  updatedAt?: string;
}

export interface SessionResponse {
  success: boolean;
  data: {
    session: Session;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface TimerState {
  remainingSeconds: number;
  progressPercent: number;
  isCompleted: boolean;
  isOffline: boolean;
  syncWarning: boolean;
}
