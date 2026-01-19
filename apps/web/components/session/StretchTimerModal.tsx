'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface StretchTimerModalProps {
  onClose: () => void;
}

const stretchExercises = [
  { id: 1, name: 'Neck Rolls', duration: 10, emoji: '🙆' },
  { id: 2, name: 'Shoulder Shrugs', duration: 10, emoji: '💪' },
  { id: 3, name: 'Wrist Rotations', duration: 10, emoji: '🤲' },
];

export function StretchTimerModal({ onClose }: StretchTimerModalProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(stretchExercises[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentExercise = stretchExercises[currentExerciseIndex];
  const totalDuration = stretchExercises.reduce(
    (sum, ex) => sum + ex.duration,
    0
  );
  const elapsedTime =
    stretchExercises
      .slice(0, currentExerciseIndex)
      .reduce((sum, ex) => sum + ex.duration, 0) +
    (currentExercise.duration - timeLeft);
  const progress = (elapsedTime / totalDuration) * 100;

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next exercise
          if (currentExerciseIndex < stretchExercises.length - 1) {
            setCurrentExerciseIndex((prev) => prev + 1);
            return stretchExercises[currentExerciseIndex + 1].duration;
          } else {
            // All exercises completed
            setIsCompleted(true);
            setIsActive(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentExerciseIndex]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handleSkip = () => {
    if (currentExerciseIndex < stretchExercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setTimeLeft(stretchExercises[currentExerciseIndex + 1].duration);
    } else {
      setIsCompleted(true);
      setIsActive(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] px-5">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full border border-white/20 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {!isCompleted ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                key={currentExercise.id}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-6xl mb-4"
              >
                {currentExercise.emoji}
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {currentExercise.name}
              </h3>
              <p className="text-white/60 text-sm">
                Exercise {currentExerciseIndex + 1} of {stretchExercises.length}
              </p>
            </div>

            {/* Timer Circle */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#22C55E"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 70}
                    strokeDashoffset={
                      2 *
                      Math.PI *
                      70 *
                      (1 - timeLeft / currentExercise.duration)
                    }
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                    animate={{
                      strokeDashoffset:
                        2 *
                        Math.PI *
                        70 *
                        (1 - timeLeft / currentExercise.duration),
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold text-white">
                    {timeLeft}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {!isActive ? (
              <Button
                onClick={handleStart}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Start Stretch Break
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  size="lg"
                  className="flex-1 text-white/70"
                >
                  Skip
                </Button>
                <Button
                  onClick={onClose}
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            )}
          </>
        ) : (
          // Completion State
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-6xl mb-4"
            >
              ✨
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Great Job!</h3>
            <p className="text-white/70 mb-6">
              You completed your stretch break. Feeling refreshed?
            </p>
            <Button
              onClick={onClose}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Back to Session
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
