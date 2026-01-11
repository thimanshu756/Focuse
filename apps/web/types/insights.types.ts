export type Period = 'today' | 'week' | 'month' | 'year' | 'all';

export interface DailyBreakdown {
  date: string;
  sessions: number;
  focusTime: number; // seconds
  completed: number;
}

export interface TaskBreakdown {
  taskId: string;
  taskTitle: string;
  sessions: number;
  focusTime: number; // seconds
}

export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  failedSessions: number;
  totalFocusTime: number; // seconds
  averageSessionDuration: number; // seconds
  completionRate: number; // percentage
  longestSession: number; // seconds
  currentStreak: number;
  dailyBreakdown: DailyBreakdown[];
  taskBreakdown: TaskBreakdown[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currentStreak: number;
  subscriptionTier: 'FREE' | 'PRO';
}
