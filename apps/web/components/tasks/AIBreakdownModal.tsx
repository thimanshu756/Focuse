'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Subtask {
  title: string;
  estimatedMinutes: number;
}

interface AIBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userTier: 'FREE' | 'PRO';
}

export function AIBreakdownModal({
  isOpen,
  onClose,
  onSuccess,
  userTier,
}: AIBreakdownModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<{
    parentTask: { title: string; description: string };
    subtasks: Subtask[];
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (userTier === 'FREE') {
      toast.error('AI breakdown is a PRO feature. Upgrade to unlock!');
      return;
    }

    setIsGenerating(true);
    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 7); // Default 7 days

      const response = await api.post('/tasks/ai-breakdown', {
        prompt: prompt.trim(),
        priority: 'MEDIUM',
        deadline: deadline.toISOString(),
      });

      if (response.data.success && response.data.data) {
        setGeneratedTasks({
          parentTask: {
            title: response.data.data.parentTask.title,
            description: response.data.data.parentTask.description || '',
          },
          subtasks: response.data.data.subtasks.map((st: any) => ({
            title: st.title,
            estimatedMinutes: st.estimatedMinutes || 60,
          })),
        });
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to generate task breakdown';
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateAll = async () => {
    if (!generatedTasks) return;

    setIsCreating(true);
    try {
      // Create parent task first
      const parentResponse = await api.post('/tasks', {
        title: generatedTasks.parentTask.title,
        description: generatedTasks.parentTask.description,
        priority: 'MEDIUM',
        status: 'TODO',
      });

      if (parentResponse.data.success) {
        const parentId = parentResponse.data.data.id;

        // Create subtasks
        await Promise.all(
          generatedTasks.subtasks.map((subtask) =>
            api.post('/tasks', {
              title: subtask.title,
              priority: 'MEDIUM',
              estimatedMinutes: subtask.estimatedMinutes,
              parentTaskId: parentId,
              status: 'TODO',
            })
          )
        );

        toast.success(
          `${generatedTasks.subtasks.length + 1} tasks created! 🎉`
        );
        onSuccess();
        handleClose();
      }
    } catch (error: any) {
      toast.error('Failed to create tasks. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setPrompt('');
    setGeneratedTasks(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold text-text-primary">
                {generatedTasks ? 'AI-Generated Task Plan' : 'Create with AI'}
              </h2>
              {userTier === 'PRO' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
                  PRO
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X size={20} />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {!generatedTasks ? (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Describe your goal
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., Study for DBMS exam in 3 days"
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-xl bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    maxLength={200}
                  />
                  <p className="mt-1 text-xs text-text-muted">
                    {prompt.length}/200
                  </p>
                </div>

                {userTier === 'FREE' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-sm text-yellow-800">
                      ✨ AI breakdown is a PRO feature. Upgrade to unlock smart
                      task planning!
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleClose}
                    className="flex-1"
                    disabled={isGenerating}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleGenerate}
                    isLoading={isGenerating}
                    disabled={
                      !prompt.trim() || isGenerating || userTier === 'FREE'
                    }
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} className="mr-2" />
                        Generate Smart Plan
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Parent Task */}
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h3 className="font-semibold text-text-primary mb-1">
                    📚 {generatedTasks.parentTask.title}
                  </h3>
                  {generatedTasks.parentTask.description && (
                    <p className="text-sm text-text-secondary">
                      {generatedTasks.parentTask.description}
                    </p>
                  )}
                </div>

                {/* Subtasks */}
                <div>
                  <h4 className="font-medium text-text-primary mb-3">
                    Subtasks:
                  </h4>
                  <div className="space-y-2">
                    {generatedTasks.subtasks.map((subtask, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-3"
                      >
                        <div className="w-5 h-5 rounded border-2 border-gray-300 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">
                            {subtask.title}
                          </p>
                          <p className="text-xs text-text-muted">
                            {Math.round(subtask.estimatedMinutes / 60)}h
                            estimated
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setGeneratedTasks(null)}
                    className="flex-1"
                    disabled={isCreating}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCreateAll}
                    isLoading={isCreating}
                    className="flex-1"
                  >
                    Create All Tasks →
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
