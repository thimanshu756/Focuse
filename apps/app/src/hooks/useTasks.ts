import { useState, useCallback } from 'react';
import { api } from '@/services/api.service';
import { Task } from '@/types/api.types';

interface CreateTaskData {
    title: string;
    description?: string;
    estimatedMinutes?: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
}

interface UpdateTaskData extends Partial<CreateTaskData> { }

interface UseTasksReturn {
    createTask: (data: CreateTaskData) => Promise<Task>;
    updateTask: (id: string, data: UpdateTaskData) => Promise<Task>;
    deleteTask: (id: string) => Promise<void>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
}

export function useTasks(): UseTasksReturn {
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const createTask = useCallback(async (data: CreateTaskData): Promise<Task> => {
        setIsCreating(true);
        try {
            const response = await api.post('/tasks', data);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error('Failed to create task');
        } catch (error: any) {
            console.error('[useTasks] Create error:', error);
            throw error;
        } finally {
            setIsCreating(false);
        }
    }, []);

    const updateTask = useCallback(
        async (id: string, data: UpdateTaskData): Promise<Task> => {
            setIsUpdating(true);
            try {
                const response = await api.patch(`/tasks/${id}`, data);
                if (response.data.success && response.data.data) {
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
        []
    );

    const deleteTask = useCallback(async (id: string): Promise<void> => {
        setIsDeleting(true);
        try {
            await api.delete(`/tasks/${id}`);
        } catch (error: any) {
            console.error('[useTasks] Delete error:', error);
            throw error;
        } finally {
            setIsDeleting(false);
        }
    }, []);

    return {
        createTask,
        updateTask,
        deleteTask,
        isCreating,
        isUpdating,
        isDeleting,
    };
}
