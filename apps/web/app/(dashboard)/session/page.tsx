'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flag } from 'lucide-react';
import { TreeAnimation } from '@/components/TreeAnimation';
import { CircularProgress } from '@/components/session/CircularProgress';
import { CompletionModal } from '@/components/session/CompletionModal';
import { GiveUpModal } from '@/components/session/GiveUpModal';
import { BackgroundWarning } from '@/components/session/BackgroundWarning';
import { Button } from '@/components/ui/Button';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { useSessionSync } from '@/hooks/useSessionSync';
import { useActiveSession } from '@/hooks/useActiveSession';
import { isAuthenticated } from '@/lib/auth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const TIPS = [
  '💡 Your tree will die if you leave the app',
  '💡 Take deep breaths and stay focused',
  "💡 You're building a forest of productivity",
  '💡 Each minute counts toward your streak',
];

export default function SessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showGiveUpModal, setShowGiveUpModal] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isGivingUp, setIsGivingUp] = useState(false);
  const [showBackgroundWarning, setShowBackgroundWarning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const tabHiddenTimeRef = useRef<number | null>(null);
  const { session: activeSession, isLoading: loadingActive } =
    useActiveSession();

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

  // Determine tree type based on duration
  const getTreeType = (): 'basic' | 'premium' | 'elite' => {
    if (!session) return 'basic';
    const minutes = session.duration / 60;
    if (minutes <= 15) return 'basic';
    if (minutes <= 45) return 'premium';
    return 'elite';
  };

  // Handle session completion
  const handleComplete = useCallback(async () => {
    if (isCompleting || !session) return;

    setIsCompleting(true);
    try {
      await api.put(`/sessions/${session.id}/complete`, {
        actualDuration: session.duration,
      });

      setShowCompletionModal(true);

      // Show confetti effect (optional)
      // TODO: Add confetti library if needed
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to complete session'
      );
    } finally {
      setIsCompleting(false);
    }
  }, [session, isCompleting]);

  // Session timer hook
  const { timeRemaining, progress, formattedTime, isUrgent } = useSessionTimer({
    duration: session?.duration || 0,
    startTime: session?.startTime || new Date(),
    endTime: session?.endTime || new Date(),
    status: session?.status || 'PAUSED',
    timeElapsed: session?.timeElapsed || 0,
    onComplete: handleComplete,
  });

  // Rotate tips every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Background detection (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the tab
        tabHiddenTimeRef.current = Date.now();
      } else {
        // User returned to the tab
        if (tabHiddenTimeRef.current) {
          const timeAway = Date.now() - tabHiddenTimeRef.current;

          // Show warning if away for > 30 seconds
          if (timeAway > 30000) {
            setShowBackgroundWarning(true);

            // Auto-dismiss after 5 seconds
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

  // Pause/Resume session
  const handlePauseResume = useCallback(async () => {
    if (!session) return;

    try {
      if (session.status === 'RUNNING') {
        await api.put(`/sessions/${session.id}/pause`);
        toast.success('Session paused');
        // Immediately refetch to update UI
        await refetch();
      } else {
        await api.put(`/sessions/${session.id}/resume`);
        toast.success('Session resumed');
        // Immediately refetch to update UI
        await refetch();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to update session'
      );
    }
  }, [session, refetch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && !showCompletionModal && !showGiveUpModal) {
        e.preventDefault();
        handlePauseResume();
      } else if (e.key === 'Escape' && !showCompletionModal) {
        e.preventDefault();
        setShowGiveUpModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCompletionModal, showGiveUpModal, handlePauseResume]);

  // Handle give up
  const handleGiveUp = async () => {
    if (!session) return;

    setIsGivingUp(true);
    try {
      await api.put(`/sessions/${session.id}/fail`, {
        reason: 'USER_GAVE_UP',
      });

      toast.error('Session abandoned');
      setShowGiveUpModal(false);

      // Wait 2 seconds to show sad tree animation
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to abandon session'
      );
      setIsGivingUp(false);
    }
  };

  // Handle back to dashboard
  const handleBack = () => {
    if (session?.status === 'RUNNING') {
      setShowBackButton(true);
    } else {
      router.push('/dashboard');
    }
  };

  // Loading state
  if (!mounted || !sessionId || (isLoading && !session)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A1A2E] to-[#16213E] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-white/60">Loading session...</p>
        </div>
      </div>
    );
  }

  // No session found after loading
  if (!session && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A1A2E] to-[#16213E] flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-white mb-4">Session not found</p>
          <Button variant="primary" onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A1A2E] to-[#16213E] flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-white mb-4">{error}</p>
          <Button variant="primary" onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const treeType = getTreeType();
  const durationMinutes = Math.floor(session.duration / 60);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1A2E] to-[#16213E] overflow-hidden">
      {/* Background Warning */}
      <BackgroundWarning isVisible={showBackgroundWarning} />

      {/* Top Bar */}
      <div className="w-full px-5 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGiveUpModal(true)}
            className="text-red-300 hover:text-red-200 hover:bg-red-500/10"
          >
            <Flag size={16} className="mr-2" />
            Give Up
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex flex-col items-center justify-center px-5 py-8"
        style={{ minHeight: 'calc(100vh - 72px)' }}
      >
        <div className="w-full max-w-2xl mx-auto space-y-8">
          {/* Tree Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div style={{ height: 280 }}>
              <TreeAnimation
                progress={progress}
                treeType={treeType}
                key={isGivingUp ? 'withering' : 'growing'}
              />
            </div>
          </motion.div>

          {/* Timer Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center"
          >
            <CircularProgress
              progress={progress}
              timeRemaining={formattedTime}
              isUrgent={isUrgent}
            />
          </motion.div>

          {/* Task Name */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center"
          >
            <p className="text-sm text-white/50 mb-1">Focusing on:</p>
            <h2 className="text-xl font-semibold text-white">
              {session.taskTitle || 'General Focus Session'}
            </h2>
          </motion.div>

          {/* Control Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center"
          >
            <Button
              variant="secondary"
              size="lg"
              onClick={handlePauseResume}
              className="w-60 bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
            >
              {session.status === 'RUNNING'
                ? '⏸️ Pause Session'
                : '▶️ Resume Session'}
            </Button>
          </motion.div>

          {/* Tip */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-sm text-white/60">{TIPS[currentTip]}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      {showCompletionModal && (
        <CompletionModal
          duration={durationMinutes}
          onClose={() => {
            setShowCompletionModal(false);
            router.push('/dashboard');
          }}
        />
      )}

      {showGiveUpModal && (
        <GiveUpModal
          onConfirm={handleGiveUp}
          onCancel={() => setShowGiveUpModal(false)}
          isLoading={isGivingUp}
        />
      )}

      {/* Back Confirmation Modal */}
      {showBackButton && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6"
          >
            <h2 className="text-xl font-semibold text-text-primary">
              Leave Session?
            </h2>
            <p className="text-text-secondary">
              Your session will continue running in the background. Return to
              dashboard?
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setShowBackButton(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Return to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
