'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/dashboard/StatCard';
import { TaskCard } from '@/components/dashboard/TaskCard';
import { QuickStartSession } from '@/components/dashboard/QuickStartSession';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { TaskModal } from '@/components/tasks/TaskModal';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useActiveSession } from '@/hooks/useActiveSession';
import { useWeeklyStats } from '@/hooks/useWeeklyStats';
import { useTasks } from '@/hooks/useTasks';
import { isAuthenticated } from '@/lib/auth';
import { Flame, Clock, TreePine, Plus, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { TaskResponse } from '@/types/task.types';

function getTimeBasedGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return { text: 'Good morning', emoji: '🌅' };
  } else if (hour >= 12 && hour < 17) {
    return { text: 'Good afternoon', emoji: '🌤️' };
  } else if (hour >= 17 && hour < 22) {
    return { text: 'Good evening', emoji: '🌙' };
  } else {
    return { text: 'Good night', emoji: '🌃' };
  }
}

function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  return hours.toFixed(1);
}

export default function DashboardPage() {
  const router = useRouter();
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [mounted, setMounted] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const {
    user,
    tasks,
    isLoading: dataLoading,
    error: dataError,
    refetch: refetchDashboardData,
  } = useDashboardData();
  const { session: activeSession, isLoading: sessionLoading } =
    useActiveSession();
  const {
    data: weeklyData,
    isLoading: statsLoading,
    error: statsError,
  } = useWeeklyStats();

  // Memoize filters to prevent useTasks from refetching on every render
  const taskFilters = useMemo(
    () => ({
      status: ['TODO', 'IN_PROGRESS'] as ('TODO' | 'IN_PROGRESS')[],
      limit: 10,
    }),
    []
  );

  const { createTask, updateTask } = useTasks(taskFilters);

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication after mount
  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      router.push('/login');
    }
  }, [mounted, router]);

  // Update greeting if time changes
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Refetch dashboard data when page becomes visible after being hidden
  // This ensures tasks are refreshed when user navigates back from task edit page
  useEffect(() => {
    let hiddenTime: number | null = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenTime = Date.now();
      } else if (document.visibilityState === 'visible' && mounted) {
        // Only refetch if page was hidden for more than 1 second
        // This prevents unnecessary refetches when just switching tabs briefly
        if (hiddenTime && Date.now() - hiddenTime > 1000) {
          refetchDashboardData();
        }
        hiddenTime = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mounted, refetchDashboardData]);

  // Calculate weekly focus time from user data
  const weeklyFocusTime = user?.totalFocusTime
    ? formatHours(user.totalFocusTime)
    : '0.0';
  const treesGrown = user?.completedSessions || 0;

  // Handle task creation
  const handleCreateTask = async (data: any) => {
    try {
      await createTask({
        ...data,
        status: 'TODO',
        dueDate: data.dueDate || undefined,
      });
      // Refetch dashboard data to show the new task
      await refetchDashboardData();
      toast.success('Task created!');
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to create task'
      );
    }
  };

  // Handle task update
  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;

    try {
      await updateTask(editingTask.id, {
        ...data,
        dueDate: data.dueDate || undefined,
      });
      // Refetch dashboard data to show the updated task
      await refetchDashboardData();
      toast.success('Task updated!');
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to update task'
      );
    }
  };

  // Handle edit button click - fetch full task data and open modal
  const handleEditTask = async (taskId: string) => {
    setIsLoadingTask(true);
    try {
      const response = await api.get(`/tasks/${taskId}`);
      if (response.data.success && response.data.data) {
        // Set the task first - the useEffect will open the modal
        setEditingTask(response.data.data);
      } else {
        toast.error('Failed to load task details');
        setIsLoadingTask(false);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to load task details'
      );
      setIsLoadingTask(false);
    }
  };

  // Open modal when editingTask is set (ensures task data is available before opening)
  useEffect(() => {
    if (editingTask && !showTaskModal) {
      setShowTaskModal(true);
      setIsLoadingTask(false);
    }
  }, [editingTask, showTaskModal]);

  // Show loading state during SSR and initial mount
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto mb-4" />
            <p className="text-sm text-text-secondary">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check authentication after mount
  if (!isAuthenticated()) {
    return null;
  }

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <>
      <main className="max-w-7xl mx-auto px-5 md:px-10 py-8">
        {/* Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {dataLoading ? (
            <Skeleton variant="text" width={300} height={28} />
          ) : (
            <h1 className="text-2xl md:text-3xl font-semibold text-text-primary">
              {greeting.text}, {firstName}! {greeting.emoji}
            </h1>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          <StatCard
            icon={Flame}
            label="Day Streak"
            value={user?.currentStreak || 0}
            color="red"
            isLoading={dataLoading}
          />
          <StatCard
            icon={Clock}
            label="Hours This Week"
            value={weeklyFocusTime}
            color="blue"
            isLoading={dataLoading || statsLoading}
          />
          <StatCard
            icon={TreePine}
            label="Trees Grown"
            value={treesGrown}
            color="green"
            isLoading={dataLoading}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Focus Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:col-span-2 "
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <span>🎯</span>
                  Today's Focus
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTask(null);
                    setShowTaskModal(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Task</span>
                </Button>
              </div>

              {dataLoading ? (
                <div className="space-y-3">
                  <Skeleton variant="rectangular" height={80} />
                  <Skeleton variant="rectangular" height={80} />
                  <Skeleton variant="rectangular" height={80} />
                </div>
              ) : dataError ? (
                <div className="p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                  <p className="text-text-secondary mb-4">{dataError}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : tasks.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    No tasks yet
                  </h3>
                  <p className="text-sm text-text-secondary mb-6">
                    Add your first task to start focusing
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditingTask(null);
                      setShowTaskModal(true);
                    }}
                  >
                    Add Your First Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      priority={task.priority}
                      status={task.status}
                      dueDate={task.dueDate}
                      onStartSession={(taskId) => {
                        router.push(`/session?taskId=${taskId}`);
                      }}
                    />
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Quick Start Session */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {sessionLoading ? (
              <Card className="p-6">
                <Skeleton variant="rectangular" height={400} />
              </Card>
            ) : (
              <QuickStartSession tasks={tasks} activeSession={activeSession} />
            )}
          </motion.div>
        </div>

        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
              <span>📊</span>
              This Week's Progress
            </h2>

            {statsLoading ? (
              <Skeleton variant="rectangular" width="100%" height={300} />
            ) : statsError ? (
              <div className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-text-secondary mb-4">{statsError}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : weeklyData.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No sessions yet
                </h3>
                <p className="text-sm text-text-secondary mb-6">
                  Start your first focus session to see your progress here!
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    const quickStart =
                      document.querySelector('[data-quick-start]');
                    quickStart?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Start Your First Session
                </Button>
              </div>
            ) : (
              <WeeklyChart data={weeklyData} />
            )}
          </Card>
        </motion.div>
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        isLoading={isLoadingTask}
      />
    </>
  );
}
