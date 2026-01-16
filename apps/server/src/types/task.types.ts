export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string; // ISO date string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes?: number;
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
  search?: string;
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
  scheduledStartTime: Date | null;
  scheduledEndTime: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskWithProject extends TaskResponse {
  // Project details would go here when Project model is added
}

export interface AIBreakdownInput {
  prompt: string;
  deadline: string; // ISO date string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface AITaskBreakdown {
  title: string;
  estimatedMinutes: number;
  description?: string;
}

export interface AIBreakdownResponse {
  tasks: AITaskBreakdown[];
}

export interface BulkDeleteInput {
  taskIds: string[];
}

export interface BulkDeleteResponse {
  deletedCount: number;
}

export interface BulkCreateInput {
  tasks: CreateTaskInput[];
}

export interface BulkCreateResponse {
  tasks: TaskResponse[];
  createdCount: number;
}
