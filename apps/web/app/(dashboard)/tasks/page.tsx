'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Search, X, AlertCircle } from 'lucide-react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { AIBreakdownModal } from '@/components/tasks/AIBreakdownModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTasks } from '@/hooks/useTasks';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { TaskResponse } from '@/types/task.types';
import toast from 'react-hot-toast';

export default function TasksPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<'FREE' | 'PRO'>('FREE');
  const [searchInput, setSearchInput] = useState('');

  const { filters, updateFilters, clearFilters } = useTaskFilters();
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update search filter when debounced value changes
  useEffect(() => {
    updateFilters({ search: debouncedSearch });
  }, [debouncedSearch, updateFilters]);

  const {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    refetch,
  } = useTasks({
    status: filters.status,
    priority: filters.priority,
    search: filters.search,
  });

  // Check authentication and fetch user tier
  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.success && response.data.data) {
          const user = response.data.data.user || response.data.data;
          setUserTier(user.subscriptionTier || 'FREE');
        }
      } catch (error) {
        // Ignore error
      }
    };
    fetchUser();
  }, [router]);

  const handleCreateTask = async (data: any) => {
    try {
      await createTask({
        ...data,
        status: 'TODO',
        dueDate: data.dueDate || undefined,
      });
      toast.success('Task created!');
      setShowTaskModal(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to create task'
      );
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    try {
      await updateTask(editingTask.id, data);
      toast.success('Task updated!');
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to update task'
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task? This action cannot be undone.')) return;

    try {
      await deleteTask(taskId);
      toast.success('Task deleted');
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to delete task'
      );
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
      toast.success('Task completed! 🎉');
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to complete task'
      );
    }
  };

  const handleStartSession = async (task: TaskResponse) => {
    try {
      let currentestimatedminutes = 0;
      if (task.estimatedMinutes && task.actualMinutes > 0) {
        currentestimatedminutes = task.estimatedMinutes - task.actualMinutes;
      } else {
        currentestimatedminutes = task.estimatedMinutes || 25;
      }
      const response = await api.post('/sessions', {
        taskId: task.id,
        duration: currentestimatedminutes,
      });

      if (response.data.success && response.data.data?.session) {
        toast.success('Focus session started! 🌱');
        router.push(`/session?sessionId=${response.data.data.session.id}`);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to start session';

      if (error.response?.status === 403) {
        toast.error(errorMessage, {
          duration: 5000,
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleStatusFilter = (
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED'
  ) => {
    if (filters.status.includes(status)) {
      updateFilters({
        status: filters.status.filter((s) => s !== status),
      });
    } else {
      updateFilters({
        status: [...filters.status, status],
      });
    }
  };

  if (!mounted || !isAuthenticated()) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="max-w-7xl mx-auto px-5 md:px-10 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-text-primary">Tasks</h1>
          <Button
            variant="primary"
            size="md"
            className="flex items-center gap-2"
            onClick={() => {
              setEditingTask(null);
              setShowTaskModal(true);
            }}
          >
            <Plus size={20} className="mr-2" />
            New Task
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-card">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <span className="text-sm font-medium text-text-secondary">
                Status:
              </span>
              {(['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'] as const).map(
                (status) => (
                  <Button
                    key={status}
                    variant={
                      filters.status.includes(status) ? 'primary' : 'secondary'
                    }
                    size="sm"
                    onClick={() => handleStatusFilter(status)}
                    className={
                      filters.status.includes(status)
                        ? 'bg-accent text-text-primary'
                        : 'bg-white text-text-secondary'
                    }
                  >
                    {status.replace('_', ' ')}
                  </Button>
                )
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <Button
                variant={
                  filters.quickFilter === 'high-priority'
                    ? 'primary'
                    : 'secondary'
                }
                size="sm"
                onClick={() =>
                  updateFilters({
                    quickFilter:
                      filters.quickFilter === 'high-priority'
                        ? undefined
                        : 'high-priority',
                    priority:
                      filters.quickFilter === 'high-priority'
                        ? undefined
                        : 'HIGH',
                  })
                }
                className={
                  filters.quickFilter === 'high-priority'
                    ? 'bg-accent text-text-primary'
                    : 'bg-white text-text-secondary'
                }
              >
                High Priority
              </Button>
            </div>

            {/* Search */}
            <div className="relative flex-1 md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Task List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width="100%"
                height={120}
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-text-secondary mb-4">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No tasks yet
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              {filters.search
                ? `No tasks found for "${filters.search}"`
                : 'Add your first task or try AI breakdown'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskModal(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus size={20} className="mr-2" />
                Add Task
              </Button>
              {userTier === 'PRO' && (
                <Button
                  variant="secondary"
                  onClick={() => setShowAIModal(true)}
                >
                  <span className="mr-2">✨</span>
                  Try AI Breakdown
                </Button>
              )}
            </div>
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput('');
                  clearFilters();
                }}
                className="mt-4"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStartSession={handleStartSession}
                onEdit={(task) => {
                  setEditingTask(task);
                  setShowTaskModal(true);
                }}
                onDelete={handleDeleteTask}
                onComplete={handleCompleteTask}
                onClick={(task) => {
                  setEditingTask(task);
                  setShowTaskModal(true);
                }}
              />
            ))}
          </div>
        )}

        {/* AI Breakdown Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-8 bg-white rounded-2xl p-6 shadow-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
                <span>✨</span>
                Create with AI
                {userTier === 'PRO' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
                    PRO
                  </span>
                )}
              </h3>
              <p className="text-sm text-text-secondary">
                {userTier === 'PRO'
                  ? 'Describe your goal and let AI break it down into actionable tasks'
                  : 'Upgrade to PRO to unlock AI-powered task breakdown'}
              </p>
            </div>
            <Button
              variant={userTier === 'PRO' ? 'primary' : 'secondary'}
              onClick={() => setShowAIModal(true)}
            >
              {userTier === 'PRO' ? 'Generate Smart Plan' : 'Upgrade to PRO'}
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />

      <AIBreakdownModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onSuccess={() => {
          refetch();
          setShowAIModal(false);
        }}
        userTier={userTier}
      />
    </>
  );
}
