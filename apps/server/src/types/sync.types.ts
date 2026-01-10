export interface SyncInput {
  lastSyncTime?: string | null; // ISO date string
  entities?: string[]; // ["sessions", "tasks", "user"]
}

export interface SyncSession {
  id: string;
  status: string;
  progress: number;
  startTime: Date;
  endTime: Date;
  taskId: string | null;
  duration: number;
  updatedAt: Date;
}

export interface SyncTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  completedAt: Date | null;
  updatedAt: Date;
}

export interface SyncUser {
  totalFocusTime: number;
  currentStreak: number;
  completedSessions: number;
  totalSessions: number;
}

export interface SyncResponse {
  sessions: SyncSession[];
  tasks: SyncTask[];
  user: SyncUser | null;
  timestamp: string; // ISO date string
}

