import { useState, useCallback, useEffect } from 'react';
import { api } from '@/services/api.service';
import { Task } from '@/types/api.types';

interface CreateTaskData {
    title: string;
    description?: string;
    estimatedMinutes?: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
}

interface UpdateTaskData extends Partial<CreateTaskData> { }

export interface TaskFilters {
    status?: string[];
    priority?: string;
    search?: string;
}

interface UseTasksReturn {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;
    createTask: (data: CreateTaskData) => Promise<Task>;
    updateTask: (id: string, data: UpdateTaskData) => Promise<Task>;
    deleteTask: (id: string) => Promise<void>;
    completeTask: (id: string) => Promise<Task>;
    refetch: () => Promise<void>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
}

export function useTasks(filters?: TaskFilters): UseTasksReturn {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const params: any = {};

            if (filters?.status && filters.status.length > 0) {
                params.status = filters.status;
            }
            if (filters?.priority) {
                params.priority = filters.priority;
            }
            if (filters?.search) {
                params.search = filters.search;
            }

            const response = await api.get('/tasks', { params });

            if (response.data.success) {
                const tasksData = response.data.data;
                // Handle both paginated and non-paginated responses
                setTasks(Array.isArray(tasksData) ? tasksData : tasksData.tasks || []);
            }
        } catch (err: any) {
            console.error('[useTasks] Fetch error:', err);
            setError(err.response?.data?.message || 'Failed to fetch tasks');
        } finally {
            setIsLoading(false);
        }
    }, [filters?.status, filters?.priority, filters?.search]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const createTask = useCallback(async (data: CreateTaskData): Promise<Task> => {
        setIsCreating(true);
        try {
            const response = await api.post('/tasks', data);
            if (response.data.success && response.data.data) {
                await fetchTasks(); // Refresh list
                return response.data.data;
            }
            throw new Error('Failed to create task');
        } catch (error: any) {
            console.error('[useTasks] Create error:', error);
            throw error;
        } finally {
            setIsCreating(false);
        }
    }, [fetchTasks]);

    const updateTask = useCallback(
        async (id: string, data: UpdateTaskData): Promise<Task> => {
            setIsUpdating(true);
            try {
                const response = await api.patch(`/tasks/${id}`, data);
                if (response.data.success && response.data.data) {
                    await fetchTasks(); // Refresh list
                    return response.data.data;
                }
                throw new Error('Failed to update task');
            } catch (error: any) {
                console.error('[useTasks] Update error:', error);
                throw error;
            } finally {
                setIsUpdating(false);
            }
        },
        [fetchTasks]
    );

    const deleteTask = useCallback(async (id: string): Promise<void> => {
        setIsDeleting(true);
        try {
            await api.delete(`/tasks/${id}`);
            await fetchTasks(); // Refresh list
        } catch (error: any) {
            console.error('[useTasks] Delete error:', error);
            throw error;
        } finally {
            setIsDeleting(false);
        }
    }, [fetchTasks]);

    const completeTask = useCallback(async (id: string): Promise<Task> => {
        setIsUpdating(true);
        try {
            const response = await api.patch(`/tasks/${id}/status`, { status: 'COMPLETED' });
            if (response.data.success && response.data.data) {
                await fetchTasks();
                return response.data.data;
            }
            throw new Error('Failed to complete task');
        } catch (error: any) {
            console.error('[useTasks] Complete error:', error);
            throw error;
        } finally {
            setIsUpdating(false);
        }
    }, [fetchTasks]);

    return {
        tasks,
        isLoading,
        error,
        createTask,
        updateTask,
        deleteTask,
        completeTask,
        refetch: fetchTasks,
        isCreating,
        isUpdating,
        isDeleting,
    };
}
