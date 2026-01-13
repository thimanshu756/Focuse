'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp } from 'lucide-react';
import { CircularProgress } from './CircularProgress';
import { Button } from '@/components/ui/Button';

interface TimerPanelProps {
  progress: number;
  timeRemaining: string;
  isUrgent: boolean;
  sessionStatus: 'RUNNING' | 'PAUSED';
  taskTitle?: string;
  duration: number;
  focusScore: number;
  distractionCount: number;
  onPauseResume: () => void;
}

const motivationalQuotes = [
  'Every minute is a victory over distraction.',
  'Your future self will thank you for this session.',
  'Deep work is your superpower.',
  'Focus is the gateway to productivity.',
  "You're building something great, one session at a time.",
  'Small focused steps lead to massive results.',
  'Your attention is your most valuable asset.',
  'Excellence is built in moments like these.',
  'Stay present. Stay focused. Stay growing.',
  'This session is an investment in your future.',
];

export function TimerPanel({
  progress,
  timeRemaining,
  isUrgent,
  sessionStatus,
  taskTitle,
  duration,
  focusScore,
  distractionCount,
  onPauseResume,
}: TimerPanelProps) {
  const [currentQuote, setCurrentQuote] = useState(
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );

  // Rotate quotes every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const newQuote =
        motivationalQuotes[
          Math.floor(Math.random() * motivationalQuotes.length)
        ];
      setCurrentQuote(newQuote);
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Calculate milestones
  const durationMinutes = Math.floor(duration / 60);
  const elapsedMinutes = Math.floor((duration * progress) / 60);
  const nextMilestone = Math.ceil(elapsedMinutes / 5) * 5;

  // Calculate focus streaks (consecutive 5-min blocks without distraction)
  const focusStreaks = Math.max(
    0,
    Math.floor(elapsedMinutes / 5) - distractionCount
  );

  // Get focus score color
  const getFocusScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-0">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Circular Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <CircularProgress
            progress={progress}
            timeRemaining={timeRemaining}
            isUrgent={isUrgent}
          />
        </motion.div>

        {/* Enhanced Session Context Card with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <p className="text-xs text-white/50 mb-2 uppercase tracking-wide">
                Focusing on
              </p>
              <h3 className="text-xl font-semibold text-white leading-tight">
                {taskTitle || 'General Focus Session'}
              </h3>
            </div>
            {taskTitle && (
              <div className="px-3 py-1 bg-yellow-400/20 rounded-full border border-yellow-400/30">
                <span className="text-xs font-medium text-yellow-300">
                  Active
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-white/70 pt-3 border-t border-white/10">
            <Clock size={16} className="text-white/60" />
            <span>
              Goal: {durationMinutes} minute{durationMinutes !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>

        {/* Enhanced Live Session Stats with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-white/50 mb-1 uppercase tracking-wide">
                Focus Streaks
              </p>
              <p className="text-2xl font-bold text-white">{focusStreaks}</p>
              <p className="text-xs text-white/40 mt-1">5-min blocks</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-white/50 mb-1 uppercase tracking-wide">
                Next Milestone
              </p>
              <p className="text-2xl font-bold text-white">
                {nextMilestone > durationMinutes
                  ? durationMinutes
                  : nextMilestone}
              </p>
              <p className="text-xs text-white/40 mt-1">minutes</p>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">Focus Score</span>
              {focusScore >= 90 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  <TrendingUp size={16} className="text-green-400" />
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`font-bold text-xl ${getFocusScoreColor(focusScore)}`}
              >
                {focusScore}%
              </span>
            </div>
          </div>

          {distractionCount > 0 && (
            <>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Distractions</span>
                <span className="text-orange-300 font-bold text-lg">
                  {distractionCount}
                </span>
              </div>
            </>
          )}
        </motion.div>

        {/* Enhanced Control Button with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            variant="secondary"
            size="lg"
            onClick={onPauseResume}
            className="w-full max-w-xs bg-white/95 backdrop-blur-xl text-gray-900 hover:bg-white shadow-[0_8px_24px_rgba(255,255,255,0.2)] font-semibold border border-white/30"
          >
            {sessionStatus === 'RUNNING'
              ? '⏸️ Pause Session'
              : '▶️ Resume Session'}
          </Button>
        </motion.div>

        {/* Enhanced Motivational Quote with Glassmorphism */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-center px-4 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
          >
            <p className="text-sm text-white/80 italic leading-relaxed">
              "{currentQuote}"
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Session Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>{elapsedMinutes} min</span>
            <span>{durationMinutes} min</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Keyboard Shortcuts Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-xs text-white/40 space-y-1"
        >
          <p>
            Press <kbd className="px-2 py-0.5 bg-white/10 rounded">Space</kbd>{' '}
            to pause/resume
          </p>
          <p>
            Press <kbd className="px-2 py-0.5 bg-white/10 rounded">Esc</kbd> to
            give up
          </p>
        </motion.div>
      </div>
    </div>
  );
}
