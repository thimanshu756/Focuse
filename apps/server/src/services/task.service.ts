import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskListFilters,
  TaskResponse,
  AIBreakdownInput,
  AIBreakdownResponse,
  BulkDeleteInput,
  BulkDeleteResponse,
} from '../types/task.types.js';

// Type for Prisma transaction client
type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// Type for task with relations
interface TaskWithRelations {
  id: string;
  sessions?: Array<{ id: string; status: string }>;
  subTasks?: Array<{ id: string; status: string }>;
}

export class TaskService {
  async createTask(userId: string, data: CreateTaskInput): Promise<TaskResponse> {
    // Validate due date is future
    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      if (dueDate <= new Date()) {
        throw new AppError('Due date must be in the future', 400, 'INVALID_DUE_DATE');
      }
    }

    // Validate estimatedMinutes range
    if (data.estimatedMinutes !== undefined) {
      if (data.estimatedMinutes < 5 || data.estimatedMinutes > 480) {
        throw new AppError(
          'Estimated minutes must be between 5 and 480',
          400,
          'INVALID_ESTIMATED_MINUTES'
        );
      }
    }

    // Verify parent task exists and belongs to user if provided
    if (data.parentTaskId) {
      const parentTask = await prisma.task.findFirst({
        where: {
          id: data.parentTaskId,
          userId,
          deletedAt: null,
        },
      });

      if (!parentTask) {
        throw new AppError('Parent task not found', 404, 'PARENT_TASK_NOT_FOUND');
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        userId,
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority || 'MEDIUM',
        estimatedMinutes: data.estimatedMinutes || null,
        parentTaskId: data.parentTaskId || null,
        tagIds: data.tagIds || [],
        status: 'TODO',
      },
    });

    logger.info('Task created', { userId, taskId: task.id, title: task.title });

    return this.formatTaskResponse(task);
  }

  async listTasks(userId: string, filters: TaskListFilters): Promise<{
    tasks: TaskResponse[];
    meta: { total: number; page: number; limit: number };
  }> {
    const { status, priority, page = 1, limit = 20 } = filters;

    const where: any = {
      userId,
    };

    if (status) {
      // Handle both single status and array of statuses
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }

    if (priority) {
      where.priority = priority;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: [
          { priority: 'desc' }, // URGENT first
          { dueDate: 'asc' }, // Soonest first
          { createdAt: 'desc' }, // Newest first
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks: tasks.map((task: any) => this.formatTaskResponse(task)),
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async getTaskById(userId: string, taskId: string): Promise<TaskResponse> {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      include: {
        subTasks: {
          where: {
            deletedAt: null,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    const formattedTask = this.formatTaskResponse(task as any);
    if (task.subTasks && task.subTasks.length > 0) {
      formattedTask.subTasks = task.subTasks.map((st: any) => this.formatTaskResponse(st));
    }

    return formattedTask;
  }

  async updateTask(
    userId: string,
    taskId: string,
    data: UpdateTaskInput
  ): Promise<TaskResponse> {
    // Verify ownership and not deleted
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
        deletedAt: null,
      },
      include: {
        subTasks: {
          where: {
            status: { not: 'COMPLETED' },
          },
        },
      },
    });

    if (!existingTask) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    // Validate due date if provided
    if (data.dueDate !== undefined) {
      if (data.dueDate !== null) {
        const dueDate = new Date(data.dueDate);
        if (dueDate <= new Date()) {
          throw new AppError('Due date must be in the future', 400, 'INVALID_DUE_DATE');
        }
      }
    }

    // Validate estimatedMinutes if provided
    if (data.estimatedMinutes !== undefined && data.estimatedMinutes !== null) {
      if (data.estimatedMinutes < 5 || data.estimatedMinutes > 480) {
        throw new AppError(
          'Estimated minutes must be between 5 and 480',
          400,
          'INVALID_ESTIMATED_MINUTES'
        );
      }
    }

    // Check if trying to complete parent task with incomplete subtasks
    if (data.status === 'COMPLETED' && existingTask.subTasks.length > 0) {
      throw new AppError(
        'Cannot complete task with incomplete subtasks',
        400,
        'INCOMPLETE_SUBTASKS'
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      } else if (existingTask.status === 'COMPLETED') {
        updateData.completedAt = null;
      }
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.estimatedMinutes !== undefined) {
      updateData.estimatedMinutes = data.estimatedMinutes;
    }
    if (data.tagIds !== undefined) updateData.tagIds = data.tagIds;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    logger.info('Task updated', { userId, taskId, updates: Object.keys(updateData) });

    return this.formatTaskResponse(updatedTask);
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    // Verify ownership and not deleted
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      include: {
        sessions: {
          where: {
            status: 'RUNNING',
          },
        },
        subTasks: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    // Check for active focus sessions
    if (task.sessions.length > 0) {
      throw new AppError(
        'Cannot delete task with active focus session',
        400,
        'ACTIVE_SESSION_EXISTS'
      );
    }

    // Soft delete task and all subtasks in transaction
    await prisma.$transaction(async (tx: PrismaTransaction) => {
      // Soft delete main task
      await tx.task.update({
        where: { id: taskId },
        data: { deletedAt: new Date() },
      });

      // Soft delete all subtasks
      if (task.subTasks.length > 0) {
        await tx.task.updateMany({
          where: {
            parentTaskId: taskId,
            deletedAt: null,
          },
          data: { deletedAt: new Date() },
        });
      }

      // Unlink from sessions (set taskId to null)
      await tx.focusSession.updateMany({
        where: {
          taskId,
          status: { not: 'RUNNING' },
        },
        data: { taskId: null },
      });
    });

    logger.info('Task deleted', { userId, taskId });
  }

  async completeTask(userId: string, taskId: string): Promise<TaskResponse> {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
        deletedAt: null,
      },
      include: {
        subTasks: {
          where: {
            deletedAt: null,
            status: { not: 'COMPLETED' },
          },
        },
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    // Check if has incomplete subtasks
    if (task.subTasks.length > 0) {
      throw new AppError(
        'Cannot complete task with incomplete subtasks',
        400,
        'INCOMPLETE_SUBTASKS'
      );
    }

    // Update task and user stats in transaction
    const updatedTask = await prisma.$transaction(async (tx: PrismaTransaction) => {
      const task = await tx.task.update({
        where: { id: taskId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Update user stats
      await tx.user.update({
        where: { id: userId },
        data: {
          // Note: User model doesn't have completedTasks field, so we skip this
          // If you add it later, uncomment:
          // completedTasks: { increment: 1 },
        },
      });

      return task;
    });

    logger.info('Task completed', {
      userId,
      taskId,
      completionTime: updatedTask.completedAt,
    });

    return this.formatTaskResponse(updatedTask);
  }

  async bulkDelete(userId: string, data: BulkDeleteInput): Promise<BulkDeleteResponse> {
    if (data.taskIds.length === 0) {
      throw new AppError('No task IDs provided', 400, 'NO_TASK_IDS');
    }

    if (data.taskIds.length > 50) {
      throw new AppError('Maximum 50 tasks can be deleted at once', 400, 'TOO_MANY_TASKS');
    }

    // Verify all tasks belong to user and not deleted
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: data.taskIds },
        userId,
        deletedAt: null,
      },
      include: {
        sessions: {
          where: {
            status: 'RUNNING',
          },
        },
      },
    });

    if (tasks.length !== data.taskIds.length) {
      throw new AppError('Some tasks not found or already deleted', 404, 'TASKS_NOT_FOUND');
    }

    // Check for active sessions
    const tasksWithActiveSessions = tasks.filter((t: TaskWithRelations) => t.sessions && t.sessions.length > 0);
    if (tasksWithActiveSessions.length > 0) {
      throw new AppError(
        'Cannot delete tasks with active focus sessions',
        400,
        'ACTIVE_SESSION_EXISTS'
      );
    }

    // Soft delete all tasks and their subtasks in transaction
    const deletedCount = await prisma.$transaction(async (tx: PrismaTransaction) => {
      const now = new Date();

      // Soft delete main tasks
      await tx.task.updateMany({
        where: {
          id: { in: data.taskIds },
          userId,
          deletedAt: null,
        },
        data: { deletedAt: now },
      });

      // Soft delete all subtasks
      await tx.task.updateMany({
        where: {
          parentTaskId: { in: data.taskIds },
          deletedAt: null,
        },
        data: { deletedAt: now },
      });

      // Unlink from sessions
      await tx.focusSession.updateMany({
        where: {
          taskId: { in: data.taskIds },
          status: { not: 'RUNNING' },
        },
        data: { taskId: null },
      });

      return tasks.length;
    });

    logger.info('Bulk delete completed', { userId, deletedCount, taskIds: data.taskIds });

    return { deletedCount };
  }

  async aiBreakdown(
    userId: string,
    data: AIBreakdownInput
  ): Promise<AIBreakdownResponse> {
    // Check user subscription and AI rate limit
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        aiRequestsThisMonth: true,
        aiRequestsResetDate: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Reset AI requests counter if month has passed
    let aiRequestsThisMonth = user.aiRequestsThisMonth;
    const now = new Date();
    if (user.aiRequestsResetDate < now) {
      aiRequestsThisMonth = 0;
      await prisma.user.update({
        where: { id: userId },
        data: {
          aiRequestsThisMonth: 0,
          aiRequestsResetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
      });
    }

    // Check rate limit for FREE users
    if (user.subscriptionTier === 'FREE' && aiRequestsThisMonth >= 3) {
      throw new AppError(
        'AI request limit reached. Upgrade to Pro for unlimited AI breakdowns.',
        429,
        'AI_RATE_LIMIT_EXCEEDED'
      );
    }

    // Validate deadline
    const deadline = new Date(data.deadline);
    if (deadline <= new Date()) {
      throw new AppError('Deadline must be in the future', 400, 'INVALID_DEADLINE');
    }

    // TODO: Call actual AI service (Gemini/OpenAI) to break down task
    // For now, create a mock breakdown
    const mockSubtasks = [
      { title: 'Review course materials', estimatedMinutes: 60 },
      { title: 'Practice problems', estimatedMinutes: 90 },
      { title: 'Create study notes', estimatedMinutes: 45 },
    ];

    // Create parent task and subtasks in transaction
    const result = await prisma.$transaction(async (tx: PrismaTransaction) => {
      // Create parent task
      const parentTask = await tx.task.create({
        data: {
          userId,
          title: `AI Breakdown: ${data.prompt.substring(0, 100)}`,
          description: `AI-generated task breakdown for: ${data.prompt}`,
          dueDate: deadline,
          priority: data.priority || 'MEDIUM',
          status: 'TODO',
          isAIGenerated: true,
          aiPrompt: data.prompt,
        },
      });

      // Create subtasks
      const subtasks = await Promise.all(
        mockSubtasks.map((subtask) =>
          tx.task.create({
            data: {
              userId,
              parentTaskId: parentTask.id,
              title: subtask.title,
              priority: data.priority || 'MEDIUM',
              estimatedMinutes: subtask.estimatedMinutes,
              status: 'TODO',
              isAIGenerated: true,
            },
          })
        )
      );

      // Update AI request count
      await tx.user.update({
        where: { id: userId },
        data: {
          aiRequestsThisMonth: { increment: 1 },
        },
      });

      // Log AI request
      await tx.aIRequest.create({
        data: {
          userId,
          requestType: 'TASK_BREAKDOWN',
          prompt: data.prompt,
          response: JSON.stringify(mockSubtasks),
          provider: 'mock',
          model: 'mock-model',
          status: 'SUCCESS',
        },
      });

      return { parentTask, subtasks };
    });

    logger.info('AI breakdown created', {
      userId,
      prompt: data.prompt,
      subtasksCount: result.subtasks.length,
    });

    return {
      parentTask: this.formatTaskResponse(result.parentTask as any),
      subtasks: result.subtasks.map((t: any) => this.formatTaskResponse(t)),
    };
  }

  private formatTaskResponse(task: any): TaskResponse {
    return {
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      estimatedMinutes: task.estimatedMinutes,
      actualMinutes: task.actualMinutes,
      tagIds: task.tagIds,
      isAIGenerated: task.isAIGenerated,
      aiPrompt: task.aiPrompt,
      parentTaskId: task.parentTaskId,
      scheduledStartTime: task.scheduledStartTime,
      scheduledEndTime: task.scheduledEndTime,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}

