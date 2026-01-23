'use client';

import { motion } from 'framer-motion';

interface CircularTimerProps {
  progress: number; // 0-100
  timeRemaining: string; // Formatted time (MM:SS)
  ringColor: string; // Color for the progress ring
  isUrgent?: boolean;
  ariaLabel?: string;
  size?: number;
}

/**
 * Circular timer with progress ring and time display
 */
export function CircularTimer({
  progress,
  timeRemaining,
  ringColor,
  isUrgent = false,
  ariaLabel,
  size = 280,
}: CircularTimerProps) {
  // Larger for hero display
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Circular Progress Ring */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
        role="timer"
        aria-label={ariaLabel}
        aria-live="polite"
        aria-atomic="true"
      >
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={strokeWidth}
          />

          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              duration: 1,
              ease: 'linear',
              // Smooth color transitions
            }}
            style={{
              filter: isUrgent
                ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))'
                : 'none',
            }}
          />
        </svg>

        {/* Timer text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`${size < 200 ? 'text-4xl' : 'text-6xl md:text-7xl'} font-bold text-white font-mono tracking-tight`}
            style={{
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            {timeRemaining}
          </span>
        </div>
      </div>
    </div>
  );
}
