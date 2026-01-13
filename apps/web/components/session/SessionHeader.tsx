'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Flag,
  MoreVertical,
  Plus,
  Camera,
  Music,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SessionHeaderProps {
  sessionCount: number;
  treeType: 'basic' | 'premium' | 'elite';
  currentStreak: number;
  onGiveUp: () => void;
  onExtendSession?: () => void;
  onToggleSound?: () => void;
  isAudioPlaying?: boolean;
  isPro: boolean;
}

const treeTypeConfig = {
  basic: {
    emoji: '🌱',
    label: 'Basic Tree',
    gradient: 'from-green-400 to-green-600',
  },
  premium: {
    emoji: '🌳',
    label: 'Premium Tree',
    gradient: 'from-emerald-400 to-teal-600',
  },
  elite: {
    emoji: '🏆',
    label: 'Elite Tree',
    gradient: 'from-yellow-400 to-orange-600',
  },
};

export function SessionHeader({
  sessionCount,
  treeType,
  currentStreak,
  onGiveUp,
  onExtendSession,
  onToggleSound,
  isAudioPlaying = false,
  isPro,
}: SessionHeaderProps) {
  const router = useRouter();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const treeConfig = treeTypeConfig[treeType];

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleExtendSession = () => {
    setShowMoreMenu(false);
    onExtendSession?.();
  };

  const handleScreenshotMode = () => {
    setShowMoreMenu(false);
    if (!isPro) {
      // TODO: Show upgrade modal
      alert('Screenshot Mode is a PRO feature');
      return;
    }
    // TODO: Implement screenshot mode
  };

  const handleBackgroundMusic = () => {
    setShowMoreMenu(false);
    // TODO: Open sound panel (Part 2)
    alert('Background Music coming in Part 2');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 px-4 lg:px-6 backdrop-blur-xl bg-black/40 border-b border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
      <div className="h-full max-w-[1920px] mx-auto flex items-center justify-between">
        {/* Left Section - Responsive */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white/70 hover:text-white hover:bg-white/10 transition-all px-2 sm:px-3"
          >
            <ArrowLeft size={16} className="sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Session Counter - Responsive */}
            <span className="text-xs sm:text-sm text-white/50 whitespace-nowrap">
              <span className="hidden sm:inline">Session #</span>
              <span className="sm:hidden">#{sessionCount}</span>
              <span className="hidden sm:inline">{sessionCount}</span>
            </span>

            <div className="w-px h-4 bg-white/20" />

            {/* Enhanced Tree Badge with Glassmorphism */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${treeConfig.gradient} backdrop-blur-sm flex items-center gap-2 shadow-lg border border-white/20`}
            >
              <span className="text-base">{treeConfig.emoji}</span>
              <span className="text-xs font-semibold text-white">
                {treeConfig.label}
              </span>
            </motion.div>

            <div className="w-px h-4 bg-white/20" />

            {/* Enhanced Streak Display with Glassmorphism */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/30 backdrop-blur-sm border border-orange-400/30 shadow-lg"
            >
              <span className="text-base">🔥</span>
              <span className="text-xs font-semibold text-orange-100">
                {currentStreak} Day Streak
              </span>
            </motion.div>
          </div>
        </div>

        {/* Right Section - Responsive */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
          {/* Sound Toggle Button - Responsive */}
          {onToggleSound && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSound}
              className={`transition-all px-2 sm:px-3 ${
                isAudioPlaying
                  ? 'text-green-300 hover:text-green-200 hover:bg-green-500/10'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Music size={16} className="sm:mr-2" />
              <span className="hidden sm:inline">
                {isAudioPlaying ? 'On' : 'Off'}
              </span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onGiveUp}
            className="text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all px-2 sm:px-3"
          >
            <Flag size={16} className="sm:mr-2" />
            <span className="hidden sm:inline">Give Up</span>
          </Button>

          {/* More Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              <MoreVertical size={16} />
            </Button>

            <AnimatePresence>
              {showMoreMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMoreMenu(false)}
                  />

                  {/* Dropdown Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.2)] border border-white/30 overflow-hidden z-50"
                  >
                    <button
                      onClick={handleExtendSession}
                      className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-100 transition-colors flex items-center gap-3"
                    >
                      <Plus size={16} className="text-gray-600" />
                      <span>Extend Session (+5 min)</span>
                    </button>

                    <button
                      onClick={handleScreenshotMode}
                      className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-100 transition-colors flex items-center gap-3"
                    >
                      <Camera size={16} className="text-gray-600" />
                      <div className="flex items-center justify-between flex-1">
                        <span>Screenshot Mode</span>
                        {!isPro && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-400 text-gray-900 rounded-full font-medium">
                            PRO
                          </span>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={handleBackgroundMusic}
                      className="w-full px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-100 transition-colors flex items-center gap-3"
                    >
                      <Music size={16} className="text-gray-600" />
                      <span>Background Music</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
