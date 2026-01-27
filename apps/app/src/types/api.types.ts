export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  taskId: string;
  duration: number;
  actualMinutes: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  startTime: string;
  endTime?: string;
  treeType?: string;
  createdAt: string;
}

export interface Tree {
  id: string;
  sessionId: string;
  type: string;
  plantedAt: string;
  growthStage: number;
}

export interface Insight {
  totalFocusTime: number;
  totalSessions: number;
  averageSessionLength: number;
  currentStreak: number;
  longestStreak: number;
  completedTasks: number;
  focusTimeByDay: {
    date: string;
    minutes: number;
  }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscriptionTier?: 'FREE' | 'PRO';
  subscriptionStatus?: 'ACTIVE' | 'INACTIVE' | 'CANCELED'; // Added
  emailVerified?: boolean; // Added
  userType?: string; // Added
  preferredFocusTime?: string; // Added
  onboardingCompleted?: boolean; // Added
  currentStreak?: number;
  longestStreak?: number; // Added
  totalFocusTime?: number; // Added
  totalSessions?: number;
  completedSessions?: number; // Added
  timezone?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
  timezone?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

