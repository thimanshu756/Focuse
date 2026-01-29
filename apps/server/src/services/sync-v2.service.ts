/**
 * Bidirectional sync service for mobile with conflict resolution
 * Implements proper CREATE/UPDATE/DELETE sync with server-timestamp-wins strategy
 */

import { PrismaClient, TaskStatus, TaskPriority, SessionStatus } from '@prisma/client';
import type {
  SyncTasksInput,
  SyncSessionsInput,
  SyncTasksResponse,
  SyncSessionsResponse,
  SyncOperation,
  ConflictItem,
} from '../types/sync.types';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class SyncV2Service {
  // ============================================================================
  // TASK SYNC
  // ============================================================================

  async syncTasks(userId: string, input: SyncTasksInput): Promise<SyncTasksResponse> {
    try {
      // Verify user exists and not deleted
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const synced: string[] = [];
      const conflictDetails: ConflictItem[] = [];
      const mapping: Record<string, string> = {};

      // Process each operation in transaction
      await prisma.$transaction(async (tx) => {
        for (const op of input.operations) {
          try {
            if (op.operation === 'CREATE') {
              await this.handleTaskCreate(userId, op, synced, conflictDetails, mapping, tx);
            } else if (op.operation === 'UPDATE') {
              await this.handleTaskUpdate(userId, op, synced, conflictDetails, tx);
            } else if (op.operation === 'DELETE') {
              await this.handleTaskDelete(userId, op, synced, conflictDetails, tx);
            }
          } catch (error) {
            // Log error but continue processing other operations
            logger.error('Sync operation failed', {
              userId,
              operation: op.operation,
              id: op.id,
              error: (error as Error).message,
            });
            conflictDetails.push({
              id: op.id,
              reason: (error as Error).message || 'Operation failed',
              operation: op.operation,
            });
          }
        }

        // Update user's lastSyncedAt
        await tx.user.update({
          where: { id: userId },
          data: { lastSyncedAt: new Date() },
        });
      });

      // Fetch server-side changes since lastSyncedAt
      const serverTasks = await this.getServerTaskChanges(userId, input.lastSyncedAt);

      logger.info('Tasks synced', {
        userId,
        deviceId: input.deviceId,
        synced: synced.length,
        conflicts: conflictDetails.length,
      });

      return {
        synced: synced.length,
        conflicts: conflictDetails.length,
        conflictDetails,
        mapping,
        serverTasks,
        lastSyncedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Task sync failed', { error: (error as Error).message, userId });
      throw new AppError('Task sync failed', 500, 'TASK_SYNC_FAILED');
    }
  }

  private async handleTaskCreate(
    userId: string,
    op: any,
    synced: string[],
    conflicts: ConflictItem[],
    mapping: Record<string, string>,
    tx: any
  ) {
    // Validate required fields
    if (!op.data?.title) {
      conflicts.push({ id: op.id, reason: 'Missing required field: title', operation: 'CREATE' });
      return;
    }

    // Check if clientId already exists (duplicate)
    const existing = await tx.task.findUnique({
      where: { clientId: op.id },
    });

    if (existing) {
      conflicts.push({ id: op.id, reason: 'Duplicate clientId', operation: 'CREATE' });
      mapping[op.id] = existing.id; // Still provide mapping
      return;
    }

    // Validate status and priority
    const status = op.data.status || 'TODO';
    const priority = op.data.priority || 'MEDIUM';

    if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
      conflicts.push({ id: op.id, reason: 'Invalid task status', operation: 'CREATE' });
      return;
    }

    if (!Object.values(TaskPriority).includes(priority as TaskPriority)) {
      conflicts.push({ id: op.id, reason: 'Invalid task priority', operation: 'CREATE' });
      return;
    }

    // Create task
    const task = await tx.task.create({
      data: {
        userId,
        title: op.data.title,
        description: op.data.description,
        status: status as TaskStatus,
        priority: priority as TaskPriority,
        dueDate: op.data.dueDate ? new Date(op.data.dueDate) : null,
        estimatedMinutes: op.data.estimatedMinutes,
        tagIds: op.data.tagIds || [],
        scheduledStartTime: op.data.scheduledStartTime ? new Date(op.data.scheduledStartTime) : null,
        scheduledEndTime: op.data.scheduledEndTime ? new Date(op.data.scheduledEndTime) : null,
        clientId: op.id, // Store temp ID for mapping
      },
    });

    mapping[op.id] = task.id;
    synced.push(task.id);
  }

  private async handleTaskUpdate(userId: string, op: any, synced: string[], conflicts: ConflictItem[], tx: any) {
    // Find task by real ID or clientId
    const task = await tx.task.findFirst({
      where: {
        OR: [{ id: op.id }, { clientId: op.id }],
        userId,
        deletedAt: null,
      },
    });

    if (!task) {
      conflicts.push({ id: op.id, reason: 'Task not found', operation: 'UPDATE' });
      return;
    }

    // Conflict resolution: server timestamp wins
    if (task.updatedAt > op.timestamp) {
      conflicts.push({
        id: op.id,
        reason: 'Server version is newer',
        operation: 'UPDATE',
      });
      return;
    }

    // Validate status and priority if provided
    if (op.data.status && !Object.values(TaskStatus).includes(op.data.status as TaskStatus)) {
      conflicts.push({ id: op.id, reason: 'Invalid task status', operation: 'UPDATE' });
      return;
    }

    if (op.data.priority && !Object.values(TaskPriority).includes(op.data.priority as TaskPriority)) {
      conflicts.push({ id: op.id, reason: 'Invalid task priority', operation: 'UPDATE' });
      return;
    }

    // Build update data (only include provided fields)
    const updateData: any = {};
    if (op.data.title !== undefined) updateData.title = op.data.title;
    if (op.data.description !== undefined) updateData.description = op.data.description;
    if (op.data.status !== undefined) updateData.status = op.data.status;
    if (op.data.priority !== undefined) updateData.priority = op.data.priority;
    if (op.data.dueDate !== undefined) updateData.dueDate = op.data.dueDate ? new Date(op.data.dueDate) : null;
    if (op.data.estimatedMinutes !== undefined) updateData.estimatedMinutes = op.data.estimatedMinutes;
    if (op.data.tagIds !== undefined) updateData.tagIds = op.data.tagIds;
    if (op.data.scheduledStartTime !== undefined)
      updateData.scheduledStartTime = op.data.scheduledStartTime ? new Date(op.data.scheduledStartTime) : null;
    if (op.data.scheduledEndTime !== undefined)
      updateData.scheduledEndTime = op.data.scheduledEndTime ? new Date(op.data.scheduledEndTime) : null;
    if (op.data.completedAt !== undefined)
      updateData.completedAt = op.data.completedAt ? new Date(op.data.completedAt) : null;

    // Update task
    await tx.task.update({
      where: { id: task.id },
      data: updateData,
    });

    synced.push(task.id);
  }

  private async handleTaskDelete(userId: string, op: any, synced: string[], conflicts: ConflictItem[], tx: any) {
    // Find task by real ID or clientId
    const task = await tx.task.findFirst({
      where: {
        OR: [{ id: op.id }, { clientId: op.id }],
        userId,
        deletedAt: null,
      },
    });

    if (!task) {
      // Already deleted or doesn't exist
      synced.push(op.id);
      return;
    }

    // Soft delete
    await tx.task.update({
      where: { id: task.id },
      data: { deletedAt: new Date() },
    });

    synced.push(task.id);
  }

  private async getServerTaskChanges(userId: string, lastSyncedAt: Date | null | undefined): Promise<any[]> {
    const where: any = {
      userId,
      deletedAt: null,
    };

    if (lastSyncedAt) {
      where.updatedAt = { gt: lastSyncedAt };
    }

    return await prisma.task.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 500,
    });
  }

  // ============================================================================
  // SESSION SYNC
  // ============================================================================

  async syncSessions(userId: string, input: SyncSessionsInput): Promise<SyncSessionsResponse> {
    try {
      // Verify user exists
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const synced: string[] = [];
      const conflictDetails: ConflictItem[] = [];
      const mapping: Record<string, string> = {};

      // Process operations in transaction
      await prisma.$transaction(async (tx) => {
        for (const op of input.operations) {
          try {
            if (op.operation === 'CREATE') {
              await this.handleSessionCreate(userId, op, synced, conflictDetails, mapping, tx);
            } else if (op.operation === 'UPDATE') {
              await this.handleSessionUpdate(userId, op, synced, conflictDetails, tx);
            } else if (op.operation === 'DELETE') {
              await this.handleSessionDelete(userId, op, synced, conflictDetails, tx);
            }
          } catch (error) {
            logger.error('Sync operation failed', {
              userId,
              operation: op.operation,
              id: op.id,
              error: (error as Error).message,
            });
            conflictDetails.push({
              id: op.id,
              reason: (error as Error).message || 'Operation failed',
              operation: op.operation,
            });
          }
        }

        // Update user's lastSyncedAt
        await tx.user.update({
          where: { id: userId },
          data: { lastSyncedAt: new Date() },
        });
      });

      // Fetch server-side changes
      const serverSessions = await this.getServerSessionChanges(userId, input.lastSyncedAt);

      logger.info('Sessions synced', {
        userId,
        deviceId: input.deviceId,
        synced: synced.length,
        conflicts: conflictDetails.length,
      });

      return {
        synced: synced.length,
        conflicts: conflictDetails.length,
        conflictDetails,
        mapping,
        serverSessions,
        lastSyncedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Session sync failed', { error: (error as Error).message, userId });
      throw new AppError('Session sync failed', 500, 'SESSION_SYNC_FAILED');
    }
  }

  private async handleSessionCreate(
    userId: string,
    op: any,
    synced: string[],
    conflicts: ConflictItem[],
    mapping: Record<string, string>,
    tx: any
  ) {
    // Validate required fields
    if (!op.data?.duration || !op.data?.startTime || !op.data?.endTime) {
      conflicts.push({ id: op.id, reason: 'Missing required fields', operation: 'CREATE' });
      return;
    }

    // Check if clientId already exists
    const existing = await tx.focusSession.findUnique({
      where: { clientId: op.id },
    });

    if (existing) {
      conflicts.push({ id: op.id, reason: 'Duplicate clientId', operation: 'CREATE' });
      mapping[op.id] = existing.id;
      return;
    }

    // Validate status
    const status = op.data.status || 'RUNNING';
    if (!Object.values(SessionStatus).includes(status as SessionStatus)) {
      conflicts.push({ id: op.id, reason: 'Invalid session status', operation: 'CREATE' });
      return;
    }

    // Validate taskId if provided
    if (op.data.taskId) {
      const task = await tx.task.findFirst({
        where: { id: op.data.taskId, userId, deletedAt: null },
      });
      if (!task) {
        conflicts.push({ id: op.id, reason: 'Task not found', operation: 'CREATE' });
        return;
      }
    }

    // Create session
    const session = await tx.focusSession.create({
      data: {
        userId,
        taskId: op.data.taskId || null,
        duration: op.data.duration,
        startTime: new Date(op.data.startTime),
        endTime: new Date(op.data.endTime),
        status: status as SessionStatus,
        progress: op.data.progress || 0,
        timeElapsed: op.data.timeElapsed || 0,
        pauseDuration: op.data.pauseDuration || 0,
        breakDuration: op.data.breakDuration || 300,
        breakTaken: op.data.breakTaken || false,
        platform: op.data.platform,
        deviceId: op.data.deviceId,
        clientId: op.id,
      },
    });

    mapping[op.id] = session.id;
    synced.push(session.id);
  }

  private async handleSessionUpdate(userId: string, op: any, synced: string[], conflicts: ConflictItem[], tx: any) {
    // Find session
    const session = await tx.focusSession.findFirst({
      where: {
        OR: [{ id: op.id }, { clientId: op.id }],
        userId,
      },
    });

    if (!session) {
      conflicts.push({ id: op.id, reason: 'Session not found', operation: 'UPDATE' });
      return;
    }

    // Conflict resolution: server timestamp wins
    if (session.updatedAt > op.timestamp) {
      conflicts.push({
        id: op.id,
        reason: 'Server version is newer',
        operation: 'UPDATE',
      });
      return;
    }

    // Build update data
    const updateData: any = {};
    if (op.data.status !== undefined) updateData.status = op.data.status;
    if (op.data.progress !== undefined) updateData.progress = op.data.progress;
    if (op.data.timeElapsed !== undefined) updateData.timeElapsed = op.data.timeElapsed;
    if (op.data.pauseDuration !== undefined) updateData.pauseDuration = op.data.pauseDuration;
    if (op.data.completedAt !== undefined)
      updateData.completedAt = op.data.completedAt ? new Date(op.data.completedAt) : null;
    if (op.data.failedAt !== undefined) updateData.failedAt = op.data.failedAt ? new Date(op.data.failedAt) : null;
    if (op.data.reason !== undefined) updateData.reason = op.data.reason;
    if (op.data.actualDuration !== undefined) updateData.actualDuration = op.data.actualDuration;
    if (op.data.breakTaken !== undefined) updateData.breakTaken = op.data.breakTaken;

    // Update session
    await tx.focusSession.update({
      where: { id: session.id },
      data: updateData,
    });

    synced.push(session.id);
  }

  private async handleSessionDelete(userId: string, op: any, synced: string[], conflicts: ConflictItem[], tx: any) {
    // Find session
    const session = await tx.focusSession.findFirst({
      where: {
        OR: [{ id: op.id }, { clientId: op.id }],
        userId,
      },
    });

    if (!session) {
      // Already deleted
      synced.push(op.id);
      return;
    }

    // Hard delete sessions (no soft delete for sessions)
    await tx.focusSession.delete({
      where: { id: session.id },
    });

    synced.push(session.id);
  }

  private async getServerSessionChanges(userId: string, lastSyncedAt: Date | null | undefined): Promise<any[]> {
    const where: any = {
      userId,
    };

    if (lastSyncedAt) {
      where.updatedAt = { gt: lastSyncedAt };
    }

    return await prisma.focusSession.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 500,
    });
  }
}
