// ============================================================================
// Legacy Sync (Read-only)
// ============================================================================

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

// ============================================================================
// Bidirectional Sync (Mobile)
// ============================================================================

export enum SyncOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface SyncOperationItem<T = any> {
  id: string; // Client temp ID or server ID
  operation: SyncOperation;
  data?: T;
  timestamp: Date;
}

export interface SyncTasksInput {
  deviceId: string;
  lastSyncedAt?: Date | null;
  operations: SyncOperationItem[];
}

export interface SyncSessionsInput {
  deviceId: string;
  lastSyncedAt?: Date | null;
  operations: SyncOperationItem[];
}

export interface ConflictItem {
  id: string;
  reason: string;
  operation: SyncOperation;
}

export interface SyncTasksResponse {
  synced: number;
  conflicts: number;
  conflictDetails: ConflictItem[];
  mapping: Record<string, string>; // Map temp client IDs to real server IDs
  serverTasks: any[]; // Tasks updated on server since lastSyncedAt
  lastSyncedAt: string;
}

export interface SyncSessionsResponse {
  synced: number;
  conflicts: number;
  conflictDetails: ConflictItem[];
  mapping: Record<string, string>;
  serverSessions: any[];
  lastSyncedAt: string;
}

