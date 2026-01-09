'use client';

import { useState, useEffect, useRef } from 'react';
import { TreeAnimation } from '@/components/TreeAnimation';
import { motion } from 'framer-motion';

export default function FocusTimer() {
  const [duration, setDuration] = useState(25 * 60); // Default 25 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate progress (0-100) based on time elapsed
  const actualProgress = ((duration - timeRemaining) / duration) * 100;

  // Show preview (100%) when not running, actual progress when running
  const progress = isRunning ? actualProgress : 100;

  // Determine tree type based on duration
  const getTreeType = (): 'basic' | 'premium' | 'elite' => {
    const minutes = duration / 60;
    if (minutes <= 15) return 'basic';
    if (minutes <= 45) return 'premium';
    return 'elite';
  };

  const treeType = getTreeType();

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  // Handle preset duration selection
  const handlePresetSelect = (minutes: number) => {
    if (!isRunning) {
      const seconds = minutes * 60;
      setDuration(seconds);
      setTimeRemaining(seconds);
      setCustomMinutes('');
    }
  };

  // Handle custom duration
  const handleCustomDuration = () => {
    const minutes = parseInt(customMinutes);
    if (!isNaN(minutes) && minutes > 0 && !isRunning) {
      const seconds = minutes * 60;
      setDuration(seconds);
      setTimeRemaining(seconds);
    }
  };

  // Start/pause timer
  const handleStartPause = () => {
    if (timeRemaining > 0) {
      setIsRunning(!isRunning);
    }
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(duration);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8] overflow-hidden">
      <div className="max-w-md mx-auto px-5 py-8">
        {/* Header */}
        <motion.h1
          className="text-[22px] font-semibold text-text-primary mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Focus Timer
        </motion.h1>

        {/* Tree Animation Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <TreeAnimation
            key={isRunning ? 'animating' : 'preview'}
            progress={progress}
            treeType={treeType}
          />
        </motion.div>

        {/* Tree Type Indicator */}
        {progress === 0 && (
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-[13px] text-text-muted">
              {treeType === 'basic' && '🌱 Basic Tree'}
              {treeType === 'premium' && '🌸 Premium Tree with Blossoms'}
              {treeType === 'elite' && '⭐ Elite Cherry Blossom Tree'}
            </p>
          </motion.div>
        )}

        {/* Timer Display Card */}
        <motion.div
          className="bg-bg-card-blue rounded-3xl p-6 mb-6 shadow-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-center">
            <div className="text-[28px] font-semibold tracking-[-0.5px] text-text-primary">
              {formatTime(timeRemaining)}
            </div>
          </div>
        </motion.div>

        {/* Duration Selection */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <label className="text-[13px] text-text-muted mb-3 block">
            Duration
          </label>

          {/* Preset Buttons */}
          <div className="grid grid-cols-5 gap-3 mb-3">
            {[1, 15, 25, 50].map((minutes) => (
              <motion.button
                key={minutes}
                onClick={() => handlePresetSelect(minutes)}
                disabled={isRunning}
                className={`h-12 rounded-xl font-medium text-[16px] transition-all ${
                  duration === minutes * 60 && !customMinutes
                    ? 'bg-accent text-text-primary shadow-md'
                    : 'bg-white text-text-secondary hover:bg-gray-50'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                whileHover={!isRunning ? { scale: 1.02 } : {}}
                whileTap={!isRunning ? { scale: 0.98 } : {}}
              >
                {minutes}min
              </motion.button>
            ))}

            {/* Custom Duration Input */}
            <div className="relative">
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => {
                  setCustomMinutes(e.target.value);
                  if (e.target.value) {
                    handleCustomDuration();
                  }
                }}
                placeholder="Custom"
                disabled={isRunning}
                className={`w-full h-12 rounded-xl font-medium text-[14px] text-center bg-white text-text-secondary border-2 ${
                  customMinutes ? 'border-accent' : 'border-transparent'
                } focus:outline-none focus:border-accent transition-all ${
                  isRunning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                min="1"
                max="180"
              />
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        {isRunning && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-[#E5ECF6] rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-accent h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* Control Buttons */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Start/Pause Button */}
          <motion.button
            onClick={handleStartPause}
            disabled={timeRemaining === 0}
            className={`w-full h-[52px] rounded-full font-semibold text-[16px] transition-all shadow-card ${
              isRunning
                ? 'bg-white text-text-primary'
                : 'bg-accent text-text-primary'
            } ${timeRemaining === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={timeRemaining > 0 ? { scale: 1.02 } : {}}
            whileTap={timeRemaining > 0 ? { scale: 0.98 } : {}}
          >
            {timeRemaining === 0
              ? 'Session Complete! 🎉'
              : isRunning
                ? 'Pause Session'
                : 'Start Focus Session'}
          </motion.button>

          {/* Reset Button */}
          {(isRunning ||
            (timeRemaining !== duration && timeRemaining !== 0)) && (
            <motion.button
              onClick={handleReset}
              className="w-full h-[48px] rounded-full font-medium text-[15px] bg-white text-text-secondary hover:bg-gray-50 transition-all"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Reset
            </motion.button>
          )}
        </motion.div>

        {/* Session Info */}
        {isRunning && actualProgress > 0 && (
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-[13px] text-text-muted">
              Your tree is {Math.round(actualProgress)}% grown
            </p>
          </motion.div>
        )}

        {/* Completion Message */}
        {timeRemaining === 0 && duration > 0 && (
          <motion.div
            className="mt-6 bg-white rounded-3xl p-6 text-center shadow-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <div className="text-[18px] font-semibold text-text-primary mb-2">
              🌳 Tree Complete!
            </div>
            <p className="text-[14px] text-text-secondary">
              Great work! You stayed focused for {duration / 60} minutes.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
