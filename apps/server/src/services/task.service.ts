import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { aiService } from './ai.service.js';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskListFilters,
  TaskResponse,
  AIBreakdownInput,
  AIBreakdownResponse,
  BulkDeleteInput,
  BulkDeleteResponse,
  BulkCreateInput,
  BulkCreateResponse,
} from '../types/task.types.js';

// Type for Prisma transaction client
type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// Type for task with relations
interface TaskWithRelations {
  id: string;
  sessions?: Array<{ id: string; status: string }>;
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

    // Create task
    const task = await prisma.task.create({
      data: {
        userId,
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority || 'MEDIUM',
        estimatedMinutes: data.estimatedMinutes || null,
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
    const { status, priority, search, page = 1, limit = 20 } = filters;

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

    // Search functionality - search in title and description
    // Note: MongoDB's contains is case-sensitive, but we'll use it for now
    // For case-insensitive search, consider using text indexes or client-side filtering
    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
      ];
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
    });

    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    return this.formatTaskResponse(task);
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

    // Hard delete task
    // Note: Sessions will have taskId set to null automatically due to onDelete: SetNull
    await prisma.task.delete({
      where: { id: taskId },
    });

    logger.info('Task hard deleted', { userId, taskId });
  }

  async completeTask(userId: string, taskId: string): Promise<TaskResponse> {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
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

    // Hard delete all tasks
    // Note: Sessions will have taskId set to null automatically due to onDelete: SetNull
    const deletedCount = await prisma.task.deleteMany({
      where: {
        id: { in: data.taskIds },
        userId,
      },
    });

    logger.info('Bulk delete completed', { userId, deletedCount: deletedCount.count, taskIds: data.taskIds });

    return { deletedCount: deletedCount.count };
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

    // Call AI service to generate task breakdown
    let aiResponse;
    let aiRequestStatus: 'SUCCESS' | 'FAILED' | 'RATE_LIMITED' | 'TIMEOUT' = 'SUCCESS';
    let errorMessage: string | null = null;
    const aiStartTime = Date.now();

    try {
      aiResponse = await aiService.generateTaskBreakdown(
        data.prompt,
        deadline,
        data.priority
      );
    } catch (error) {
      // Handle AI service errors
      if (error instanceof AppError) {
        // Map error codes to AI request statuses
        if (error.code === 'AI_RATE_LIMITED') {
          aiRequestStatus = 'RATE_LIMITED';
        } else if (error.code === 'AI_TIMEOUT') {
          aiRequestStatus = 'TIMEOUT';
        } else {
          aiRequestStatus = 'FAILED';
        }
        errorMessage = error.message;

        // Re-throw user-facing errors
        throw error;
      }

      // Unexpected errors
      aiRequestStatus = 'FAILED';
      errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Unexpected AI service error', {
        userId,
        error: errorMessage,
      });
      throw new AppError(
        'Failed to generate task breakdown. Please try again.',
        500,
        'AI_SERVICE_ERROR'
      );
    }
    
    // Create all tasks as independent tasks in transaction
    // const result = await prisma.$transaction(async (tx: PrismaTransaction) => {
    //   // Create all independent tasks from AI response
    //   const tasks = await Promise.all(
    //     aiResponse.data.tasks.map((task) =>
    //       tx.task.create({
    //         data: {
    //           userId,
    //           title: task.title,
    //           description: task.description || `AI-generated task from breakdown: ${data.prompt}`,
    //           dueDate: deadline,
    //           priority: data.priority || 'MEDIUM',
    //           estimatedMinutes: task.estimatedMinutes,
    //           status: 'TODO',
    //           isAIGenerated: true,
    //           aiPrompt: data.prompt,
    //         },
    //       })
    //     )
    //   );

    //   // Update AI request count (only on success)
    //   if (aiRequestStatus === 'SUCCESS') {
    //     await tx.user.update({
    //       where: { id: userId },
    //       data: {
    //         aiRequestsThisMonth: { increment: 1 },
    //       },
    //     });
    //   }

    //   // Log AI request with full details
    //   await tx.aIRequest.create({
    //     data: {
    //       userId,
    //       requestType: 'TASK_BREAKDOWN',
    //       prompt: data.prompt,
    //       response: JSON.stringify(aiResponse.data),
    //       provider: aiResponse.provider,
    //       model: aiResponse.model,
    //       tokensUsed: aiResponse.tokensUsed || null,
    //       latencyMs: aiResponse.latencyMs,
    //       status: aiRequestStatus,
    //       errorMessage: errorMessage,
    //     },
    //   });

    //   return tasks;
    // });

    // logger.info('AI breakdown created', {
    //   userId,
    //   prompt: data.prompt,
    //   tasksCount: result.length,
    // });

    return {
      tasks: aiResponse.data.tasks,
    };
  }

  async bulkCreate(userId: string, data: BulkCreateInput): Promise<BulkCreateResponse> {
    if (data.tasks.length === 0) {
      throw new AppError('No tasks provided', 400, 'NO_TASKS');
    }

    if (data.tasks.length > 50) {
      throw new AppError('Maximum 50 tasks can be created at once', 400, 'TOO_MANY_TASKS');
    }

    // Validate all tasks before creating
    for (const taskData of data.tasks) {
      // Validate due date if provided
      if (taskData.dueDate) {
        const dueDate = new Date(taskData.dueDate);
        if (dueDate <= new Date()) {
          throw new AppError(
            `Due date must be in the future for task: ${taskData.title}`,
            400,
            'INVALID_DUE_DATE'
          );
        }
      }

      // Validate estimatedMinutes if provided
      if (taskData.estimatedMinutes !== undefined) {
        if (taskData.estimatedMinutes < 5 || taskData.estimatedMinutes > 480) {
          throw new AppError(
            `Estimated minutes must be between 5 and 480 for task: ${taskData.title}`,
            400,
            'INVALID_ESTIMATED_MINUTES'
          );
        }
      }
    }

    // Create all tasks in a transaction
    const result = await prisma.$transaction(async (tx: PrismaTransaction) => {
      const tasks = await Promise.all(
        data.tasks.map((taskData) =>
          tx.task.create({
            data: {
              userId,
              title: taskData.title,
              description: taskData.description || null,
              dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
              priority: taskData.priority || 'MEDIUM',
              estimatedMinutes: taskData.estimatedMinutes || null,
              tagIds: taskData.tagIds || [],
              status: 'TODO',
            },
          })
        )
      );

      return tasks;
    });

    logger.info('Bulk create completed', {
      userId,
      createdCount: result.length,
      taskTitles: result.map((t) => t.title),
    });

    return {
      tasks: result.map((task) => this.formatTaskResponse(task)),
      createdCount: result.length,
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
      scheduledStartTime: task.scheduledStartTime,
      scheduledEndTime: task.scheduledEndTime,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}

 
