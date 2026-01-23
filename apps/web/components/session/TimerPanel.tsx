'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Music } from 'lucide-react';
import { CircularTimer } from './CircularTimer';
import { TimerControls } from './TimerControls';
import { AmbientSoundPanel } from './AmbientSoundPanel';
import { useAccurateSessionTimer } from '@/hooks/useAccurateSessionTimer';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { useUserProfile } from '@/hooks/useUserProfile';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

interface TimerPanelProps {
  sessionId: string;
  durationSeconds: number;
  startTime: Date;
  endTime: Date;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED';
  timeElapsed?: number;
  taskTitle?: string;
  taskDescription?: string;
  onComplete: () => void;
  onSessionUpdate?: (session: any) => void;
  onProgressUpdate?: (progress: number) => void;
  orientation?: 'portrait' | 'landscape'; // Mobile orientation
  isMobile?: boolean; // Is mobile device
}

/**
 * Main timer panel component that combines circular timer and controls
 */
export function TimerPanel({
  sessionId,
  durationSeconds,
  startTime,
  endTime,
  status,
  timeElapsed = 0,
  taskTitle,
  taskDescription,
  onComplete,
  onSessionUpdate,
  onProgressUpdate,
  orientation = 'portrait',
  isMobile = false,
}: TimerPanelProps) {
  const router = useRouter();
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [localStatus, setLocalStatus] = useState<
    'RUNNING' | 'PAUSED' | 'COMPLETED'
  >(status);
  const [showSoundPanel, setShowSoundPanel] = useState(false);

  // Get user profile for subscription tier
  const { user } = useUserProfile();
  const isPro = user?.subscriptionTier === 'PRO';

  // Ambient sound hook
  const {
    sounds,
    isPlaying: isSoundPlaying,
    activeSound,
    volume,
    soundEnabled,
    audioError,
    toggleSound,
    updateVolume,
    fadeOut,
    fadeIn,
    enableAudio,
  } = useAmbientSound(isPro);

  // Sync localStatus with prop changes (from server updates)
  useEffect(() => {
    if (status !== localStatus && !isRequestPending) {
      setLocalStatus(status);
    }
  }, [status, localStatus, isRequestPending]);

  // Use accurate timer hook
  const {
    timeRemaining,
    progress,
    formattedTime,
    isUrgent,
    isCompleted,
    isOffline,
    syncWarning,
    ringColor,
    ariaLabel,
  } = useAccurateSessionTimer({
    sessionId,
    durationSeconds,
    startTime,
    endTime,
    status: localStatus,
    timeElapsed,
    onComplete,
    onSessionUpdate,
  });

  // Notify parent of progress updates for tree animation
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate(progress);
    }
  }, [progress, onProgressUpdate]);

  // Handle pause
  const handlePause = useCallback(async () => {
    if (isRequestPending) return;

    // Fade out sound when pausing
    if (isSoundPlaying) {
      await fadeOut();
    }

    // Optimistic UI update
    setLocalStatus('PAUSED');
    setIsRequestPending(true);

    try {
      await api.put(`/sessions/${sessionId}/pause`);
      toast.success('Session paused');
      // Session update will come through onSessionUpdate callback
    } catch (error: any) {
      // Revert optimistic update
      setLocalStatus('RUNNING');
      // Fade in sound if pause failed
      if (soundEnabled && activeSound) {
        await fadeIn();
      }
      toast.error(
        error.response?.data?.error?.message || 'Could not pause. Try again.'
      );
    } finally {
      setIsRequestPending(false);
    }
  }, [
    sessionId,
    isRequestPending,
    isSoundPlaying,
    fadeOut,
    soundEnabled,
    activeSound,
    fadeIn,
  ]);

  // Handle resume
  const handleResume = useCallback(async () => {
    if (isRequestPending) return;

    // Optimistic UI update
    setLocalStatus('RUNNING');
    setIsRequestPending(true);

    try {
      const response = await api.put(`/sessions/${sessionId}/resume`);

      if (response.data.success && response.data.data?.session) {
        const session = response.data.data.session;
        // Update endTime if server returned new one
        if (session.endTime && onSessionUpdate) {
          onSessionUpdate(session);
        }
      }

      toast.success('Session resumed');

      // Fade in sound if it was enabled
      if (soundEnabled && activeSound) {
        await fadeIn();
      }
    } catch (error: any) {
      // Revert optimistic update
      setLocalStatus('PAUSED');
      toast.error(
        error.response?.data?.error?.message || 'Could not resume. Try again.'
      );
    } finally {
      setIsRequestPending(false);
    }
  }, [
    sessionId,
    isRequestPending,
    onSessionUpdate,
    soundEnabled,
    activeSound,
    fadeIn,
  ]);

  // Handle break (placeholder)
  const handleBreak = useCallback(() => {
    // Placeholder - will be implemented in future feature
    console.log('Break requested');
  }, []);

  // Handle sound toggle
  const handleSoundToggle = useCallback(
    async (soundKey: string) => {
      const sound = sounds.find((s) => s.key === soundKey);
      if (!sound) return;

      // Check PRO access
      if (sound.isPro && !isPro) {
        toast('Upgrade to PRO to unlock this sound', {
          icon: '⭐',
          duration: 3000,
        });
        return;
      }

      await toggleSound(soundKey);
    },
    [sounds, isPro, toggleSound]
  );

  // Handle upgrade click
  const handleUpgradeClick = useCallback(() => {
    router.push('/profile?upgrade=true');
  }, [router]);

  // Handle completion state
  if (isCompleted || durationSeconds === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center text-center space-y-6"
      >
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
          Session Completed
        </h2>
        <p className="text-white/80 text-base md:text-lg mb-6">
          Great job! You've completed your focus session.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </motion.div>
    );
  }

  // Dynamic spacing based on orientation
  const getContainerClasses = () => {
    if (!isMobile) {
      // Desktop: Center vertically in the panel
      return 'w-full flex-1 flex flex-col items-center justify-center';
    }

    if (orientation === 'landscape') {
      // Landscape: compact spacing
      return 'w-full flex flex-col items-center mt-2';
    } else {
      // Portrait: comfortable spacing
      return 'w-full flex flex-col items-center mt-4';
    }
  };

  const getTaskInfoClasses = () => {
    // Hidden on small screens to prevent scrolling, visible on md+ (tablet/desktop)
    return 'hidden md:block mb-6 md:mb-8 max-w-md px-4 text-center';
  };

  const getTitleClasses = () => {
    if (!isMobile) {
      return 'text-lg md:text-xl font-semibold text-white mb-2';
    }

    if (orientation === 'landscape') {
      // Landscape: smaller text
      return 'text-sm font-semibold text-white mb-1';
    } else {
      // Portrait: medium text
      return 'text-base font-semibold text-white mb-2';
    }
  };

  const getDescriptionClasses = () => {
    if (!isMobile) {
      return 'text-sm md:text-base text-white/70 leading-relaxed';
    }

    if (orientation === 'landscape') {
      // Landscape: hide description to save space
      return 'hidden';
    } else {
      // Portrait: show description
      return 'text-xs text-white/70 leading-relaxed line-clamp-2';
    }
  };

  return (
    <div className={getContainerClasses()}>
      {/* Task Info */}
      {taskTitle && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={getTaskInfoClasses()}
        >
          <h2 className={getTitleClasses()}>{taskTitle}</h2>
          {taskDescription && (
            <p className={getDescriptionClasses()}>{taskDescription}</p>
          )}
        </motion.div>
      )}

      {/* Offline Badge */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 text-sm"
          >
            Offline
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Warning */}
      <AnimatePresence>
        {syncWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-200 text-sm"
          >
            Time sync adjusted
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circular Timer */}
      <CircularTimer
        progress={progress}
        timeRemaining={formattedTime}
        ringColor={ringColor}
        isUrgent={isUrgent}
        ariaLabel={ariaLabel}
        size={isMobile ? 180 : 280}
      />

      {/* Progress & Music - Mobile Layout */}
      {isMobile ? (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSoundPanel(!showSoundPanel)}
            className={`rounded-full w-10 h-10 ${isSoundPlaying ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white bg-white/5'}`}
            aria-label="Background sound"
          >
            <Music size={18} />
          </Button>
          <p className="text-lg text-white/90 font-medium">
            {progress}% complete
          </p>
        </div>
      ) : (
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xl text-white/90 font-medium">
            {progress}% complete
          </p>
        </motion.div>
      )}

      {/* Controls */}
      <TimerControls
        status={localStatus}
        isRequestPending={isRequestPending}
        isOffline={isOffline}
        onPause={handlePause}
        onResume={handleResume}
        onBreak={handleBreak}
        onSoundClick={() => setShowSoundPanel(!showSoundPanel)}
        isSoundPlaying={isSoundPlaying}
      />

      {/* Sound Panel */}
      {showSoundPanel && (
        <AmbientSoundPanel
          sounds={sounds}
          activeSound={activeSound}
          isPlaying={isSoundPlaying}
          volume={volume}
          isPro={isPro}
          audioError={audioError}
          onToggleSound={handleSoundToggle}
          onVolumeChange={updateVolume}
          onClose={() => setShowSoundPanel(false)}
          onEnableAudio={enableAudio}
          onUpgradeClick={handleUpgradeClick}
        />
      )}

      {/* Aria live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {localStatus === 'RUNNING' &&
          `Session running. ${formattedTime} remaining.`}
        {localStatus === 'PAUSED' &&
          `Session paused. ${formattedTime} remaining.`}
        {isCompleted && 'Session completed.'}
      </div>
    </div>
  );
}
