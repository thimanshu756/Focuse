'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { TreePanel, TreePanelRef } from '@/components/session/TreePanel';
import { InfoPanel } from '@/components/session/InfoPanel';
import { AmbientAnimations } from '@/components/session/AmbientAnimations';
import { SessionHeader } from '@/components/session/SessionHeader';
import { TimerPanel } from '@/components/session/TimerPanel';
import { CompletionModal } from '@/components/session/CompletionModal';
import { GiveUpModal } from '@/components/session/GiveUpModal';
import { BackgroundWarning } from '@/components/session/BackgroundWarning';
import { OrientationToggle } from '@/components/session/OrientationToggle';
import { Button } from '@/components/ui/Button';
import { useSessionSync } from '@/hooks/useSessionSync';
import { useActiveSession } from '@/hooks/useActiveSession';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMilestoneCelebrations } from '@/hooks/useMilestoneCelebrations';
import { useSessionNotes } from '@/hooks/useSessionNotes';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { getGradientForTime } from '@/utils/time-gradients';
import { isAuthenticated } from '@/lib/auth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showGiveUpModal, setShowGiveUpModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isGivingUp, setIsGivingUp] = useState(false);
  const [showBackgroundWarning, setShowBackgroundWarning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [treeProgress, setTreeProgress] = useState(0);
  const [isGivingUpState, setIsGivingUpState] = useState(false);
  const [isCompletingState, setIsCompletingState] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'portrait'
  );

  const tabHiddenTimeRef = useRef<number | null>(null);
  const treePanelRef = useRef<TreePanelRef>(null);
  const { session: activeSession, isLoading: loadingActive } =
    useActiveSession();
  const { timeOfDay } = useTimeOfDay();
  const { user } = useUserProfile();
  const isPro = user?.subscriptionTier === 'PRO';

  // Check for reduced motion preference and screen size
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    mediaQuery.addEventListener('change', handleMotionChange);
    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication and get session ID
  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Try to get session ID from URL first, then use active session
    const urlSessionId = searchParams.get('sessionId');
    if (urlSessionId) {
      setSessionId(urlSessionId);
    } else if (activeSession) {
      setSessionId(activeSession.id);
    } else if (!loadingActive) {
      // No active session found, redirect to dashboard
      toast.error('No active session found');
      router.push('/dashboard');
    }
  }, [mounted, searchParams, activeSession, loadingActive, router]);

  // Get session data with sync
  const { session, isLoading, error, refetch } = useSessionSync(
    sessionId || '',
    10000
  );

  // Get notes count for completion/give up modals (only if sessionId exists)
  const { notes: sessionNotes, clearNotes: clearSessionNotes } =
    useSessionNotes({
      sessionId: sessionId || '',
      isPro: isPro || false,
    });

  // Ambient sound hook for fade out on completion/give up
  const ambientSound = useAmbientSound(isPro || false);
  const fadeOutSound = ambientSound.fadeOut;
  const soundEnabled = ambientSound.soundEnabled;

  // Handle session completion
  const handleComplete = useCallback(async () => {
    if (isCompleting || !session || isCompletingState) return;

    setIsCompletingState(true);
    setIsCompleting(true);

    // Fade out ambient sound
    if (soundEnabled && fadeOutSound) {
      try {
        await fadeOutSound();
      } catch (error) {
        // Ignore errors - sound fade is not critical
      }
    }

    // Trigger tree glow animation
    treePanelRef.current?.glow();

    try {
      await api.put(`/sessions/${session.id}/complete`, {
        actualDuration: session.duration,
      });

      setShowCompletionModal(true);

      // Clear notes after session completes (notes are session-specific)
      // Delay cleanup to allow modal to show notes count
      setTimeout(() => {
        clearSessionNotes();
      }, 1000);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to complete session'
      );
      // Still show modal optimistically
      setShowCompletionModal(true);

      // Clear notes even on error
      setTimeout(() => {
        clearSessionNotes();
      }, 1000);
    } finally {
      setIsCompleting(false);
    }
  }, [
    session,
    isCompleting,
    isCompletingState,
    soundEnabled,
    fadeOutSound,
    clearSessionNotes,
  ]);

  // Handle session update from timer (pause/resume)
  const handleSessionUpdate = useCallback(
    (updatedSession: any) => {
      // Refetch to get latest session state
      refetch();
    },
    [refetch]
  );

  // Calculate tree type based on duration
  const getTreeType = (): 'basic' | 'premium' | 'elite' => {
    if (!session) return 'basic';
    const minutes = session.duration / 60;
    if (minutes <= 15) return 'basic';
    if (minutes <= 45) return 'premium';
    return 'elite';
  };

  // Update tree progress when session changes
  useEffect(() => {
    if (session && session.duration > 0) {
      const elapsed = session.timeElapsed || 0;
      const progress = Math.min(
        100,
        Math.round((elapsed / session.duration) * 100)
      );
      setTreeProgress(progress);
    } else {
      setTreeProgress(0);
    }
  }, [session?.timeElapsed, session?.duration]);

  // Background detection (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabHiddenTimeRef.current = Date.now();
      } else {
        if (tabHiddenTimeRef.current) {
          const timeAway = Date.now() - tabHiddenTimeRef.current;

          if (timeAway > 30000) {
            setShowBackgroundWarning(true);
            setTimeout(() => {
              setShowBackgroundWarning(false);
            }, 5000);
          }

          tabHiddenTimeRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showCompletionModal) {
        e.preventDefault();
        setShowGiveUpModal(true);
      }
      // Space key pause/resume is handled by TimerControls component
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCompletionModal]);

  // Handle give up
  const handleGiveUp = async () => {
    if (!session || isGivingUpState) return;

    setIsGivingUpState(true);
    setIsGivingUp(true);

    // Fade out ambient sound
    if (soundEnabled && fadeOutSound) {
      try {
        await fadeOutSound();
      } catch (error) {
        // Ignore errors - sound fade is not critical
      }
    }

    // Trigger tree wither animation
    treePanelRef.current?.wither();

    try {
      await api.put(`/sessions/${session.id}/fail`, {
        reason: 'USER_GAVE_UP',
      });

      toast.error('Session abandoned');
      setShowGiveUpModal(false);

      // Clear notes when session is given up
      clearSessionNotes();

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to abandon session'
      );
      setIsGivingUp(false);
      setIsGivingUpState(false);

      // Clear notes even on error
      clearSessionNotes();
    }
  };

  // Calculate elapsed minutes and progress for milestones and give up modal
  const elapsedMinutes = session
    ? Math.floor((session.timeElapsed || 0) / 60)
    : 0;
  const progressPercent = session
    ? Math.min(
        100,
        Math.round(((session.timeElapsed || 0) / session.duration) * 100)
      )
    : 0;

  // Milestone celebrations
  useMilestoneCelebrations({
    elapsedMinutes,
    durationMinutes: Math.floor((session?.duration || 0) / 60),
    onTreePulse: () => {
      treePanelRef.current?.pulse();
    },
    reducedMotion,
  });

  // Check if session is already completed on load
  useEffect(() => {
    if (session && session.status === 'COMPLETED' && !showCompletionModal) {
      // Show completion modal for already-completed sessions
      setShowCompletionModal(true);
      // Clear notes for already-completed sessions
      clearSessionNotes();
    }
  }, [session, showCompletionModal, clearSessionNotes]);

  // Get gradient for current time of day
  const backgroundGradient = getGradientForTime(timeOfDay);

  // Loading state
  if (!mounted || !sessionId || (isLoading && !session)) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{
          background:
            'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        }}
      >
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white mx-auto mb-4" />
          <p className="text-white/80 text-base">Loading session...</p>
        </div>
      </div>
    );
  }

  // No session found after loading
  if (!session && !isLoading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center px-5"
        style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        }}
      >
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            No Active Session
          </h2>
          <p className="text-white/80 mb-6">
            Return to dashboard to start a session
          </p>
          <Button variant="secondary" onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center px-5"
        style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        }}
      >
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-white mb-2">Error</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <Button variant="secondary" onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const durationMinutes = Math.floor((session?.duration || 0) / 60);

  // Determine layout classes based on orientation and screen size
  const isPortraitMode = isMobile && orientation === 'portrait';
  const isLandscapeMode = isMobile && orientation === 'landscape';

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background Warning */}
      <BackgroundWarning isVisible={showBackgroundWarning} />

      {/* Session Header */}
      <SessionHeader
        sessionDuration={session?.duration || 0}
        onGiveUp={() => setShowGiveUpModal(true)}
        isMobile={isMobile}
      />

      {/* Orientation Toggle - Only on mobile */}
      {isMobile && (
        <OrientationToggle
          orientation={orientation}
          onToggle={setOrientation}
        />
      )}

      {/* Main Layout Container - Responsive based on orientation */}
      <div
        className={`h-full w-full flex ${
          isLandscapeMode
            ? 'flex-row'
            : isPortraitMode
              ? 'flex-col'
              : 'flex-col lg:flex-row'
        }`}
      >
        {/* Tree Panel - Adaptive sizing based on orientation */}
        <TreePanel
          ref={treePanelRef}
          backgroundGradient={backgroundGradient}
          progress={treeProgress}
          treeType={getTreeType()}
          isWithering={isGivingUpState}
          isCelebrating={isCompletingState}
          orientation={orientation}
          isMobile={isMobile}
        >
          {/* Ambient animations for tree panel */}
          <AmbientAnimations
            timeOfDay={timeOfDay}
            reducedMotion={reducedMotion}
            isMobile={isMobile}
          />
        </TreePanel>

        {/* Info Panel - Adaptive sizing based on orientation */}
        <InfoPanel
          backgroundGradient={backgroundGradient}
          orientation={orientation}
          isMobile={isMobile}
        >
          {/* Ambient animations for info panel */}
          <AmbientAnimations
            timeOfDay={timeOfDay}
            reducedMotion={reducedMotion}
            isMobile={isMobile}
          />

          {/* Timer Panel */}
          {session && session.status !== 'FAILED' && (
            <TimerPanel
              sessionId={session.id}
              durationSeconds={session.duration}
              startTime={session.startTime}
              endTime={session.endTime}
              status={
                session.status === 'COMPLETED'
                  ? 'COMPLETED'
                  : session.status === 'PAUSED'
                    ? 'PAUSED'
                    : 'RUNNING'
              }
              timeElapsed={session.timeElapsed}
              taskTitle={session.taskTitle}
              taskDescription={session.taskDescription}
              onComplete={handleComplete}
              onSessionUpdate={handleSessionUpdate}
              onProgressUpdate={setTreeProgress}
              orientation={orientation}
              isMobile={isMobile}
            />
          )}
        </InfoPanel>
      </div>

      {/* Modals */}
      {showCompletionModal && session && (
        <CompletionModal
          duration={durationMinutes}
          treeTier={getTreeType()}
          sessionNumber={user?.totalSessions}
          streak={user?.currentStreak}
          notesCount={sessionNotes.length}
          onClose={() => {
            setShowCompletionModal(false);
            router.push('/dashboard');
          }}
        />
      )}

      {showGiveUpModal && session && (
        <GiveUpModal
          onConfirm={handleGiveUp}
          onCancel={() => setShowGiveUpModal(false)}
          isLoading={isGivingUp}
          elapsedMinutes={elapsedMinutes}
          progressPercent={progressPercent}
          notesCount={sessionNotes.length}
          willBreakStreak={false} // TODO: Check if this will break streak from backend
        />
      )}
    </div>
  );
}
