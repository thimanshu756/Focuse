'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { TaskResponse } from '@/types/task.types';
import { Option } from '@/types/select.types';

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
    watch,
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

  const priorityOptions: Option[] = useMemo(
    () => [
      { value: 'LOW', label: 'Low' },
      { value: 'MEDIUM', label: 'Medium' },
      { value: 'HIGH', label: 'High' },
      { value: 'URGENT', label: 'Urgent' },
    ],
    []
  );

  const currentPriority = watch('priority');
  const selectedPriority = useMemo(
    () => priorityOptions.find((opt) => opt.value === currentPriority) || null,
    [currentPriority, priorityOptions]
  );

  // Reset and populate form when modal opens or task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Format dueDate for date input (YYYY-MM-DD format)
        let formattedDueDate = '';
        if (task.dueDate) {
          try {
            const date =
              task.dueDate instanceof Date
                ? task.dueDate
                : new Date(task.dueDate);
            if (!isNaN(date.getTime())) {
              formattedDueDate = date.toISOString().split('T')[0];
            }
          } catch (e) {
            // Invalid date, leave empty
            formattedDueDate = '';
          }
        }

        // Reset form with task values - ensure this runs when task is set
        reset(
          {
            title: task.title || '',
            description: task.description || '',
            priority:
              (task.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') ||
              'MEDIUM',
            dueDate: formattedDueDate,
            estimatedMinutes: task.estimatedMinutes ?? undefined,
          },
          {
            keepDefaultValues: false,
          }
        );
      } else if (!isLoading && !task) {
        // Only reset to default values for new task if not loading and no task
        // This prevents clearing the form while task data is being fetched
        reset({
          title: '',
          description: '',
          priority: 'MEDIUM',
          dueDate: '',
          estimatedMinutes: undefined,
        });
      }
    }
  }, [isOpen, task, reset, isLoading]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: TaskFormData) => {
    // Convert date-only string to ISO datetime string if dueDate is provided
    const submitData = {
      ...data,
      dueDate:
        data.dueDate && data.dueDate.trim()
          ? new Date(`${data.dueDate}T23:59:59`).toISOString()
          : undefined,
    };
    await onSubmit(submitData);
    // Form will be reset when modal reopens via useEffect
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
              <Select
                options={priorityOptions}
                value={selectedPriority}
                onChange={(option) => {
                  if (option) {
                    setValue(
                      'priority',
                      option.value as TaskFormData['priority']
                    );
                  }
                }}
                placeholder="Select priority"
                error={errors.priority?.message}
              />
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
