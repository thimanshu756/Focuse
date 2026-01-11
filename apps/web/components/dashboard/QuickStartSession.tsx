'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Play, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Option } from '@/types/select.types';

interface Task {
  id: string;
  title: string;
}

interface QuickStartSessionProps {
  tasks: Task[];
  activeSession?: {
    id: string;
    taskTitle?: string;
    duration: number;
    timeElapsed: number;
  } | null;
}

export function QuickStartSession({
  tasks,
  activeSession,
}: QuickStartSessionProps) {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<Option | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [isStarting, setIsStarting] = useState(false);

  const durations = [15, 25, 50];

  // Convert tasks to select options
  const taskOptions: Option[] = useMemo(() => {
    return [
      { value: '', label: 'No task' },
      ...tasks.map((task) => ({
        value: task.id,
        label: task.title,
      })),
    ];
  }, [tasks]);

  // If active session exists, show resume card
  if (activeSession) {
    const remainingSeconds = activeSession.duration - activeSession.timeElapsed;
    const remainingMinutes = Math.floor(remainingSeconds / 60);
    const remainingSecs = remainingSeconds % 60;

    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-yellow-50 rounded-2xl">
            <Play className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Session in Progress
            </h3>
            <p className="text-sm text-text-secondary">
              {activeSession.taskTitle || 'Focus Session'}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-2xl font-semibold text-text-primary mb-1">
            {remainingMinutes}:{remainingSecs.toString().padStart(2, '0')}{' '}
            remaining
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => router.push('/session')}
        >
          Resume Session →
        </Button>
      </Card>
    );
  }

  const handleStartSession = async () => {
    if (!selectedDuration && !customDuration) {
      toast.error('Please select a duration');
      return;
    }

    const duration = selectedDuration || parseInt(customDuration);
    if (!duration || duration < 5 || duration > 240) {
      toast.error('Duration must be between 5 and 240 minutes');
      return;
    }

    setIsStarting(true);

    try {
      const response = await api.post('/sessions', {
        taskId: selectedTask?.value || null,
        duration,
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
        // FREE tier limit
        toast.error(errorMessage, {
          duration: 5000,
          action: {
            label: 'Upgrade',
            onClick: () => router.push('/upgrade'),
          },
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 rounded-2xl">
          <Clock className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary">
          Quick Start Focus Session
        </h3>
      </div>

      <div className="space-y-4">
        {/* Task Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Select task (optional)
          </label>
          <Select
            options={taskOptions}
            value={selectedTask}
            onChange={(option) => setSelectedTask(option)}
            placeholder="Choose a task..."
            isSearchable={tasks.length > 5}
            isClearable
          />
        </div>

        {/* Duration Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Duration
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {durations.map((duration) => (
              <button
                key={duration}
                onClick={() => {
                  setSelectedDuration(duration);
                  setCustomDuration('');
                }}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  selectedDuration === duration
                    ? 'bg-accent text-text-primary'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                {duration}m
              </button>
            ))}
            <button
              onClick={() => {
                setSelectedDuration(null);
                setCustomDuration('');
              }}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                !selectedDuration && customDuration
                  ? 'bg-accent text-text-primary'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              Custom
            </button>
          </div>
          {(!selectedDuration || customDuration) && (
            <input
              type="number"
              min="5"
              max="240"
              value={customDuration}
              onChange={(e) => {
                setCustomDuration(e.target.value);
                setSelectedDuration(null);
              }}
              placeholder="Enter minutes (5-240)"
              className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          )}
        </div>

        {/* Start Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleStartSession}
          isLoading={isStarting}
          disabled={!selectedDuration && !customDuration}
        >
          <Play className="h-5 w-5 mr-2" />
          Start Focus Session 🌱
        </Button>
      </div>
    </Card>
  );
}
