export interface Task {
  id: string;
  title: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
}

export interface Session {
  id: string;
  taskId: string | null;
  userId: string;
  duration: number; // in seconds
  startTime: string;
  endTime: string | null;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  plantedTree: boolean;
  treeType?: 'basic' | 'premium' | 'elite' | 'dead';
  task?: Task | null; // Nested task data from API
  createdAt: string;
  updatedAt: string;
}

export interface ForestStats {
  totalTrees: number;
  totalTime: number; // in seconds
  formattedTime: string;
  currentStreak: number;
}

export type DateFilterOption =
  | 'today'
  | 'week'
  | 'month'
  | '30days'
  | '90days'
  | 'all';
export type TreeTypeFilterOption =
  | 'all'
  | 'basic'
  | 'premium'
  | 'elite'
  | 'dead';

export interface ForestFilters {
  dateRange: DateFilterOption;
  treeType: TreeTypeFilterOption;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currentStreak: number;
  totalFocusTime: number;
  completedSessions: number;
  subscriptionTier: 'FREE' | 'PRO';
}
