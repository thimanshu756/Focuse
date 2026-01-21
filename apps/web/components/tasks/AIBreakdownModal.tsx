'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { aiApi, api } from '@/lib/api';
import toast from 'react-hot-toast';

interface GeneratedTask {
  title: string;
  estimatedMinutes: number;
  description?: string;
}

interface AIBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userTier: 'FREE' | 'PRO';
}

const GENERATION_STAGES = [
  { text: 'CHITRA is analyzing your goal...', duration: 1500 },
  { text: 'CHITRA is planning the workflow...', duration: 1500 },
  { text: 'CHITRA is creating smart tasks...', duration: 1500 },
  { text: 'CHITRA is optimizing your plan...', duration: 1000 },
];
export function AIBreakdownModal({
  isOpen,
  onClose,
  onSuccess,
  userTier,
}: AIBreakdownModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set()
  );
  const [isCreating, setIsCreating] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);

  // Cycle through quick stages during generation
  useEffect(() => {
    if (!isGenerating) {
      setCurrentStage(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % GENERATION_STAGES.length);
    }, GENERATION_STAGES[currentStage].duration);

    return () => clearInterval(timer);
  }, [isGenerating, currentStage]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (userTier === 'FREE') {
      toast.error('AI breakdown is a PRO feature. Upgrade to unlock!');
      return;
    }

    setIsGenerating(true);
    setCurrentStage(0);

    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 7); // Default 7 days

      const response = await aiApi.post('/tasks/ai-breakdown', {
        prompt: prompt.trim(),
        priority: 'MEDIUM',
        deadline: deadline.toISOString(),
      });

      if (response.data.success && response.data.data?.tasks) {
        const tasks = response.data.data.tasks;
        setGeneratedTasks(tasks);
        // Select all tasks by default
        setSelectedIndices(
          new Set(tasks.map((_: any, index: number) => index))
        );
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
    if (generatedTasks.length === 0 || selectedIndices.size === 0) {
      toast.error('Please select at least one task to create');
      return;
    }

    setIsCreating(true);
    try {
      // Get selected tasks
      const selectedTasks = generatedTasks
        .filter((_, index) => selectedIndices.has(index))
        .map((task) => ({
          title: task.title,
          description: task.description,
          priority: 'MEDIUM' as const,
          estimatedMinutes: task.estimatedMinutes,
        }));

      // Bulk create selected tasks
      const response = await api.post('/tasks/bulk-create', {
        tasks: selectedTasks,
      });

      if (response.data.success) {
        toast.success(`${response.data.data.createdCount} task(s) created! 🎉`);
        onSuccess();
        handleClose();
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to create tasks. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setPrompt('');
    setGeneratedTasks([]);
    setSelectedIndices(new Set());
    onClose();
  };

  const toggleTask = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const toggleAll = () => {
    if (selectedIndices.size === generatedTasks.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(generatedTasks.map((_, i) => i)));
    }
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
                {generatedTasks.length > 0
                  ? 'Chitra-Generated Task Plan'
                  : 'Create with Chitra'}
              </h2>
              {userTier === 'PRO' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-text-primary">
                  PRO
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X size={20} />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {generatedTasks.length === 0 ? (
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
                    disabled={
                      !prompt.trim() || isGenerating || userTier === 'FREE'
                    }
                    className="flex-1 justify-center items-center min-h-[44px]"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2 w-full">
                        <div className="relative flex-shrink-0">
                          <Loader2
                            className="animate-spin text-black"
                            size={18}
                          />
                          <motion.div
                            className="absolute inset-0"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          >
                            <Sparkles
                              className="text-black/60"
                              size={10}
                              style={{
                                position: 'absolute',
                                top: -2,
                                right: -2,
                              }}
                            />
                          </motion.div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={currentStage}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.3 }}
                              className="text-sm font-medium text-black truncate"
                            >
                              {GENERATION_STAGES[currentStage].text}
                            </motion.p>
                          </AnimatePresence>
                        </div>
                      </div>
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
                {/* Header with select all */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <h4 className="font-medium text-text-primary">
                    AI Generated Tasks ({generatedTasks.length})
                  </h4>
                  <button
                    onClick={toggleAll}
                    className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
                  >
                    {selectedIndices.size === generatedTasks.length ? (
                      <>
                        <CheckSquare size={16} />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <Square size={16} />
                        Select All
                      </>
                    )}
                  </button>
                </div>

                {/* Task List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {generatedTasks.map((task, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => toggleTask(index)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedIndices.has(index)
                          ? 'border-accent bg-accent/5'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {selectedIndices.has(index) ? (
                            <CheckSquare size={20} className="text-accent" />
                          ) : (
                            <Square size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary mb-1">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-text-secondary mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-muted bg-gray-100 px-2 py-0.5 rounded-full">
                              ⏱️ {task.estimatedMinutes} min
                            </span>
                            <span className="text-xs text-text-muted bg-gray-100 px-2 py-0.5 rounded-full">
                              ~{Math.ceil(task.estimatedMinutes / 25)} sessions
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Selected count info */}
                <div className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-800">
                    {selectedIndices.size === 0 ? (
                      'No tasks selected'
                    ) : (
                      <>
                        <strong>{selectedIndices.size}</strong> task
                        {selectedIndices.size !== 1 ? 's' : ''} selected •{' '}
                        <strong>
                          {generatedTasks
                            .filter((_, i) => selectedIndices.has(i))
                            .reduce(
                              (sum, t) => sum + t.estimatedMinutes,
                              0
                            )}{' '}
                          min
                        </strong>{' '}
                        total
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => {
                      setGeneratedTasks([]);
                      setSelectedIndices(new Set());
                    }}
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
                    disabled={selectedIndices.size === 0}
                    className="flex-1"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Creating...
                      </>
                    ) : (
                      `Create ${selectedIndices.size} Task${
                        selectedIndices.size !== 1 ? 's' : ''
                      } →`
                    )}
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
