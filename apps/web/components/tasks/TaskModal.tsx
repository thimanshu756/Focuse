'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { TaskResponse } from '@/apps/server/src/types/task.types';

const taskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
  estimatedMinutes: z.number().min(5).max(480).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  task?: TaskResponse | null;
  isLoading?: boolean;
}

export function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  isLoading = false,
}: TaskModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: '',
      estimatedMinutes: undefined,
    },
  });

  useEffect(() => {
    if (task) {
      setValue('title', task.title);
      setValue('description', task.description || '');
      setValue('priority', task.priority);
      setValue(
        'dueDate',
        task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      );
      setValue('estimatedMinutes', task.estimatedMinutes || undefined);
    } else {
      reset();
    }
  }, [task, setValue, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: TaskFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md"
      >
        <Card className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <Input
              label="Title"
              {...register('title')}
              error={errors.title?.message}
              placeholder="Enter task title"
              autoFocus
            />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-xl bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                placeholder="Add description (optional)"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full p-3 border border-gray-300 rounded-xl bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Due Date
              </label>
              <Input
                type="date"
                {...register('dueDate')}
                error={errors.dueDate?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Estimated Time (minutes)
              </label>
              <Input
                type="number"
                {...register('estimatedMinutes', { valueAsNumber: true })}
                error={errors.estimatedMinutes?.message}
                placeholder="e.g., 60"
                min={5}
                max={480}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="flex-1"
              >
                {task ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
