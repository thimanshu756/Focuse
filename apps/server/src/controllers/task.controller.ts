import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { TaskService } from '../services/task.service.js';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskListFilters,
  AIBreakdownInput,
  BulkDeleteInput,
  BulkCreateInput,
} from '../types/task.types.js';

export class TaskController {
  private taskService = new TaskService();

  createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: CreateTaskInput = req.body;
      const task = await this.taskService.createTask(req.user!.id, data);
      res.status(201).json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  };

  listTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Handle status query param - can be string, array of strings, or undefined
      // Express parses status[]=TODO&status[]=IN_PROGRESS as array
      let status: TaskListFilters['status'] = undefined;
      if (req.query.status) {
        if (Array.isArray(req.query.status)) {
          // Validate all items in array
          const validStatuses = req.query.status.filter((s) =>
            ['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'].includes(s as string)
          ) as Array<'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED'>;
          status = validStatuses.length > 0 ? validStatuses : undefined;
        } else {
          // Single status value
          const statusStr = req.query.status as string;
          if (['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'].includes(statusStr)) {
            status = statusStr as 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
          }
        }
      }

      const filters: TaskListFilters = {
        status,
        priority: req.query.priority as any,
        search: req.query.search as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      };

      const result = await this.taskService.listTasks(req.user!.id, filters);
      res.json({
        success: true,
        data: result.tasks,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  getTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const taskId = req.params.id;
      const task = await this.taskService.getTaskById(req.user!.id, taskId);
      res.json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const taskId = req.params.id;
      const data: UpdateTaskInput = req.body;
      const task = await this.taskService.updateTask(req.user!.id, taskId, data);
      res.json({
        success: true,
        data: { task },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const taskId = req.params.id;
      await this.taskService.deleteTask(req.user!.id, taskId);
      res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  completeTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const taskId = req.params.id;
      const task = await this.taskService.completeTask(req.user!.id, taskId);
      res.json({
        success: true,
        data: { task },
        message: 'Task marked as completed',
      });
    } catch (error) {
      next(error);
    }
  };

  bulkDelete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: BulkDeleteInput = req.body;
      const result = await this.taskService.bulkDelete(req.user!.id, data);
      res.json({
        success: true,
        data: result,
        message: `${result.deletedCount} task(s) deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  aiBreakdown = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: AIBreakdownInput = req.body;
      const result = await this.taskService.aiBreakdown(req.user!.id, data);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Task breakdown created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  bulkCreate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: BulkCreateInput = req.body;
      const result = await this.taskService.bulkCreate(req.user!.id, data);
      res.status(201).json({
        success: true,
        data: result,
        message: `${result.createdCount} task(s) created successfully`,
      });
    } catch (error) {
      next(error);
    }
  };
}

