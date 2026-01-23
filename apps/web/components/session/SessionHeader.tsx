'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MoreVertical,
  Music,
  Plus,
  Maximize,
  Minimize,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';

interface SessionHeaderProps {
  sessionDuration: number; // Duration in seconds
  onGiveUp: () => void;
  isMobile?: boolean;
  isFullscreen?: boolean;
  orientation?: 'portrait' | 'landscape';
  onToggleOrientation?: (orientation: 'portrait' | 'landscape') => void;
  onToggleFullScreen?: () => void;
}

interface UserStats {
  totalSessions: number;
  currentStreak: number;
}

type TreeTier = 'basic' | 'premium' | 'elite';

/**
 * Session Header Bar with navigation, metadata, and actions
 */
export function SessionHeader({
  sessionDuration,
  onGiveUp,
  isMobile = false,
  isFullscreen = false,
  orientation,
  onToggleOrientation,
  onToggleFullScreen,
}: SessionHeaderProps) {
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoadingProfile(true);
        setProfileError(false);
        const response = await api.get('/auth/me');
        if (response.data.success && response.data.data?.user) {
          const user = response.data.data.user;
          setUserStats({
            totalSessions: user.totalSessions || 0,
            currentStreak: user.currentStreak || 0,
          });
        }
      } catch (error) {
        // Set error state, will show default values
        setProfileError(true);
        setUserStats({
          totalSessions: 0,
          currentStreak: 0,
        });
        console.error('Failed to fetch user stats:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserStats();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  // Calculate tree tier based on duration (in seconds)
  const getTreeTier = (): TreeTier => {
    if (sessionDuration <= 900) return 'basic'; // <= 15 minutes
    if (sessionDuration <= 2700) return 'premium'; // <= 45 minutes
    return 'elite'; // > 45 minutes
  };

  const treeTier = sessionDuration > 0 ? getTreeTier() : 'basic';

  const treeTierConfig = {
    basic: {
      emoji: '🌱',
      label: 'Basic Tree',
      labelShort: 'Basic',
      gradient: 'from-green-500 to-green-600',
    },
    premium: {
      emoji: '🌳',
      label: 'Premium Tree',
      labelShort: 'Premium',
      gradient: 'from-blue-500 to-blue-600',
    },
    elite: {
      emoji: '🏆',
      label: 'Elite Tree',
      labelShort: 'Elite',
      gradient: 'from-yellow-500 to-orange-500',
    },
  };

  const handleExtendSession = async () => {
    // TODO: Implement extend session API call
    setIsMenuOpen(false);
    // For now, just log
    console.log('Extend session +5 min');
  };

  const handleToggleMusic = () => {
    // TODO: Implement music toggle (Feature 5)
    setIsMenuOpen(false);
    console.log('Toggle background music');
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-[60px] z-50 flex items-center justify-between px-4 md:px-6 py-3 md:py-4"
      style={{
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Left Section - Back Button */}
      <div className="flex-1 flex items-center">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-transparent rounded-md px-2 py-1 min-h-[44px] min-w-[44px]"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={20} />
          {!isMobile && (
            <span className="text-sm font-medium">Back to Dashboard</span>
          )}
        </button>
      </div>

      {/* Center Section - Metadata */}
      <div className="flex-1 flex items-center justify-center gap-2 md:gap-3 flex-wrap">
        {/* Session Counter - Hidden on mobile */}
        {!isMobile && (
          <>
            {isLoadingProfile ? (
              <Skeleton
                variant="rectangular"
                width={80}
                height={20}
                className="bg-white/20 rounded"
              />
            ) : (
              <>
                <span className="text-sm text-white/60">
                  Session #{userStats?.totalSessions ?? '-'}
                </span>
                <span className="text-white/30">•</span>
              </>
            )}
          </>
        )}

        {/* Tree Tier Badge */}
        {sessionDuration > 0 ? (
          <div
            className={`px-2 md:px-3 py-1 rounded-xl bg-gradient-to-r ${treeTierConfig[treeTier].gradient} flex items-center gap-1.5`}
          >
            <span className="text-sm">{treeTierConfig[treeTier].emoji}</span>
            <span className="text-xs md:text-sm font-medium text-white">
              {isMobile
                ? treeTierConfig[treeTier].labelShort
                : treeTierConfig[treeTier].label}
            </span>
          </div>
        ) : (
          <div className="px-2 md:px-3 py-1 rounded-xl bg-white/20 flex items-center gap-1.5">
            <span className="text-sm">🌳</span>
            <span className="text-xs md:text-sm font-medium text-white">
              Tree
            </span>
          </div>
        )}
      </div>

      {/* Right Section - Action Buttons */}
      <div className="flex-1 flex items-center justify-end gap-2 md:gap-3">
        {/* Full Screen Button - Hidden on mobile if needed, but requested to be available */}
        {onToggleFullScreen && (
          <button
            onClick={onToggleFullScreen}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-transparent min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        )}

        {/* Give Up Button */}
        <button
          onClick={onGiveUp}
          className="text-xs md:text-sm text-red-400 hover:text-red-300 hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-transparent rounded-md px-2 py-1 min-h-[44px]"
          aria-label="Give up session"
        >
          Give Up
        </button>

        {/* More Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-transparent min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="More options"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical size={20} />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-[200px] rounded-xl py-2"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <button
                  onClick={handleExtendSession}
                  className="w-full px-3 py-2.5 text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
                  tabIndex={0}
                >
                  <Plus size={16} />
                  <span>Extend Session (+5 min)</span>
                </button>
                <button
                  onClick={handleToggleMusic}
                  className="w-full px-3 py-2.5 text-left text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
                  tabIndex={0}
                >
                  <Music size={16} />
                  <span>Background Music</span>
                </button>
                <div className="h-px bg-white/10 my-1" />
                <div className="px-3 py-2">
                  <p className="text-xs text-white/50 mb-2 uppercase tracking-wider font-medium">
                    Orientation
                  </p>
                  <div className="flex bg-black/20 rounded-lg p-1">
                    <button
                      onClick={() => onToggleOrientation?.('portrait')}
                      className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all ${
                        orientation === 'portrait'
                          ? 'bg-white/10 text-white'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Portrait
                    </button>
                    <button
                      onClick={() => onToggleOrientation?.('landscape')}
                      className={`flex-1 flex items-center justify-center py-1.5 rounded-md text-xs font-medium transition-all ${
                        orientation === 'landscape'
                          ? 'bg-white/10 text-white'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Landscape
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
