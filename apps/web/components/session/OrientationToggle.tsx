'use client';

import { motion } from 'framer-motion';
import { Smartphone, Monitor } from 'lucide-react';

interface OrientationToggleProps {
  orientation: 'portrait' | 'landscape';
  onToggle: (orientation: 'portrait' | 'landscape') => void;
}

/**
 * Toggle component to switch between portrait and landscape viewing modes
 * Perfect for marketing demos and user preference
 */
export function OrientationToggle({
  orientation,
  onToggle,
}: OrientationToggleProps) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[60] md:hidden"
      role="radiogroup"
      aria-label="Screen orientation"
    >
      <div
        className="flex items-center gap-1 rounded-full p-1"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Portrait Button */}
        <button
          onClick={() => onToggle('portrait')}
          className={`relative flex items-center justify-center px-3 py-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px] min-w-[44px] ${
            orientation === 'portrait'
              ? 'text-text-primary'
              : 'text-white/60 hover:text-white/80'
          }`}
          aria-label="Portrait mode"
          aria-checked={orientation === 'portrait'}
          role="radio"
        >
          {orientation === 'portrait' && (
            <motion.div
              layoutId="orientationBg"
              className="absolute inset-0 bg-accent rounded-full"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Smartphone
            size={20}
            className="relative z-10"
            strokeWidth={orientation === 'portrait' ? 2.5 : 2}
          />
        </button>

        {/* Landscape Button */}
        <button
          onClick={() => onToggle('landscape')}
          className={`relative flex items-center justify-center px-3 py-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px] min-w-[44px] ${
            orientation === 'landscape'
              ? 'text-text-primary'
              : 'text-white/60 hover:text-white/80'
          }`}
          aria-label="Landscape mode"
          aria-checked={orientation === 'landscape'}
          role="radio"
        >
          {orientation === 'landscape' && (
            <motion.div
              layoutId="orientationBg"
              className="absolute inset-0 bg-accent rounded-full"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Monitor
            size={20}
            className="relative z-10"
            strokeWidth={orientation === 'landscape' ? 2.5 : 2}
          />
        </button>
      </div>

      {/* Helper Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-2 text-center"
      >
        <span className="text-xs text-white/60 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
          {orientation === 'portrait' ? 'Portrait' : 'Landscape'}
        </span>
      </motion.div>
    </div>
  );
}
