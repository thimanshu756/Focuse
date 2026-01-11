export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string; // ISO date string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes?: number;
  parentTaskId?: string;
  tagIds?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string; // ISO date string
  estimatedMinutes?: number;
  tagIds?: string[];
}

export interface TaskListFilters {
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED' | Array<'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED'>;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  page?: number;
  limit?: number;
}

export interface TaskResponse {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  estimatedMinutes: number | null;
  actualMinutes: number;
  tagIds: string[];
  isAIGenerated: boolean;
  aiPrompt: string | null;
  parentTaskId: string | null;
  scheduledStartTime: Date | null;
  scheduledEndTime: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subTasks?: TaskResponse[];
}

export interface TaskWithProject extends TaskResponse {
  // Project details would go here when Project model is added
}

export interface AIBreakdownInput {
  prompt: string;
  deadline: string; // ISO date string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface AIBreakdownResponse {
  parentTask: TaskResponse;
  subtasks: TaskResponse[];
}

export interface BulkDeleteInput {
  taskIds: string[];
}

export interface BulkDeleteResponse {
  deletedCount: number;
}

