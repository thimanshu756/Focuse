import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NetInfo from '@react-native-community/netinfo';
import { COLORS, SPACING } from '@/constants/theme';

// Components
import { TimerPanel } from '@/components/session/TimerPanel';
import { TreePanel, type TreePanelRef } from '@/components/session/TreePanel';
import { SessionHeader } from '@/components/session/SessionHeader';
import { CompletionModal } from '@/components/session/CompletionModal';
import { GiveUpModal } from '@/components/session/GiveUpModal';
import { PauseOverlay } from '@/components/session/PauseOverlay';
import { BackgroundWarning } from '@/components/session/BackgroundWarning';
import { AmbientAnimations } from '@/components/session/AmbientAnimations';
import { SessionNotesDrawer } from '@/components/session/SessionNotesDrawer';
import { AmbientSoundPanel } from '@/components/session/AmbientSoundPanel';

// Hooks
import { useSessionSync } from '@/hooks/useSessionSync';
import { useActiveSession } from '@/hooks/useActiveSession';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import { useBackgroundDetection } from '@/hooks/useBackgroundDetection';
import { useSessionNotes } from '@/hooks/useSessionNotes';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { useMilestoneCelebrations } from '@/hooks/useMilestoneCelebrations';
import { useWakeLock } from '@/hooks/useWakeLock';

// Services & Utils
import { isAuthenticated } from '@/services/auth.service';
import { api } from '@/services/api.service';
import { getTreeType } from '@/utils/session-helpers';
import { getGradientForTime } from '@/utils/time-gradients';

// Types
import type { NoteType, NotesDraft } from '@/types/notes.types';

export default function FocusSession() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width, height } = useWindowDimensions();

  // Core state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isGivingUp, setIsGivingUp] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [treeProgress, setTreeProgress] = useState(0);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showGiveUpModal, setShowGiveUpModal] = useState(false);
  const [showSoundPanel, setShowSoundPanel] = useState(false);

  // Refs
  const treePanelRef = useRef<TreePanelRef>(null);

  // Detect orientation
  const orientation = width > height ? 'landscape' : 'portrait';

  // Get time-based gradient
  const { timeOfDay } = useTimeOfDay();
  const backgroundGradient = getGradientForTime(timeOfDay);

  // Get active session as fallback
  const { session: activeSession, isLoading: loadingActive } = useActiveSession();

  // Fetch session data with sync
  const { session, isLoading, error, refetch } = useSessionSync(sessionId || '', 10000);

  // Keep screen awake during session
  useWakeLock({ enabled: mounted && !!session });

  // Background detection
  const { showWarning, timeAwayMs, dismissWarning } = useBackgroundDetection({
    warningThresholdMs: 30000,
    onForeground: async (awayMs) => {
      if (awayMs > 30000) {
        setIsSyncing(true);
        await refetch();
        setIsSyncing(false);
      }
    },
  });

  // Session notes (only if session exists)
  const {
    notes,
    draft,
    canAddNote,
    noteCount,
    maxNotes,
    addNote,
    deleteNote,
    clearNotes,
    saveDraft,
  } = useSessionNotes({
    sessionId: sessionId || '',
    isPro: false, // TODO: Get from user context
  });

  // Ambient sound
  const {
    currentSound,
    volume,
    isPlaying: isSoundPlaying,
    isLoading: isSoundLoading,
    availableSounds,
    setSound,
    setVolume,
    play: playSound,
    pause: pauseSound,
    fadeIn,
    fadeOut,
  } = useAmbientSound({
    isPro: false, // TODO: Get from user context
    sessionActive: !isPaused && mounted,
  });

  // Milestone celebrations
  useMilestoneCelebrations({
    elapsedMinutes,
    enabled: mounted && !isPaused,
    onTreePulse: () => treePanelRef.current?.pulse(),
  });

  // Network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.replace('/auth/login');
        return;
      }
      setMounted(true);
    };
    checkAuth();
  }, [router]);

  // Set session ID from route params or active session
  useEffect(() => {
    if (!mounted) return;

    if (id) {
      setSessionId(id);
    } else if (activeSession) {
      setSessionId(activeSession.id);
    } else if (!loadingActive) {
      Alert.alert('No Active Session', 'Please start a session from the dashboard.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    }
  }, [mounted, id, activeSession, loadingActive, router]);

  // Track pause state from session
  useEffect(() => {
    if (session) {
      setIsPaused(session.status === 'PAUSED');
    }
  }, [session?.status]);

  // Calculate tree type based on duration
  const treeType = session ? getTreeType(session.duration) : 'basic';

  /**
   * Handle tree progress updates
   */
  const handleProgressUpdate = useCallback((progress: number) => {
    setTreeProgress(progress);
    // Calculate elapsed minutes from progress and session duration
    // Use session directly - it's safe because this callback is only called
    // when TimerPanel updates progress, which requires session to exist
    if (session) {
      const elapsedSeconds = (progress / 100) * session.duration;
      setElapsedMinutes(Math.floor(elapsedSeconds / 60));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handle session completion
   */
  const handleComplete = async () => {
    if (!session || isCompleting) return;

    setIsCompleting(true);

    // Fade out sound
    await fadeOut();

    // Trigger tree glow animation
    treePanelRef.current?.glow();

    try {
      await api.put(`/sessions/${session.id}/complete`, {
        actualDuration: session.duration,
      });

      // Clear session notes
      await clearNotes();

      // Show completion modal
      setShowCompletionModal(true);
    } catch (err: any) {
      console.error('Failed to complete session:', err);
      // Still show completion on error (optimistic)
      setShowCompletionModal(true);
    } finally {
      setIsCompleting(false);
    }
  };

  /**
   * Handle give up confirmation
   */
  const handleGiveUpConfirm = async () => {
    if (!session || isGivingUp) return;

    setIsGivingUp(true);
    setShowGiveUpModal(false);

    // Fade out sound
    await fadeOut();

    // Trigger tree wither animation
    treePanelRef.current?.wither();

    try {
      await api.put(`/sessions/${session.id}/fail`, {
        reason: 'USER_GAVE_UP',
      });

      // Clear notes
      await clearNotes();

      // Navigate after animation
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to fail session:', err);
      router.replace('/(tabs)');
    }
  };

  /**
   * Handle resume from pause
   */
  const handleResume = async () => {
    if (!session || isResuming) return;

    setIsResuming(true);

    try {
      await api.put(`/sessions/${session.id}/resume`);
      await refetch();
      await fadeIn();
    } catch (err: any) {
      console.error('Failed to resume session:', err);
    } finally {
      setIsResuming(false);
    }
  };

  /**
   * Handle close button
   */
  const handleClose = () => {
    Alert.alert(
      'Leave Session?',
      'You can give up (loses progress) or just leave (session continues in background).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Give Up',
          style: 'destructive',
          onPress: () => setShowGiveUpModal(true),
        },
        { text: 'Leave', onPress: () => router.back() },
      ]
    );
  };

  /**
   * Handle add note
   */
  const handleAddNote = useCallback(
    async (content: string, type: NoteType): Promise<boolean> => {
      return addNote(content, type);
    },
    [addNote]
  );

  /**
   * Handle draft change
   */
  const handleDraftChange = useCallback(
    (newDraft: NotesDraft) => {
      saveDraft(newDraft);
    },
    [saveDraft]
  );

  /**
   * Handle sound toggle
   */
  const handleSoundToggle = () => {
    if (isSoundPlaying) {
      pauseSound();
    } else {
      playSound();
    }
  };

  // Loading state
  if (!mounted || !sessionId || (isLoading && !session)) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary.accent} />
          <Text style={styles.loadingText}>Loading session...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Session Not Found</Text>
          <Text style={styles.errorText}>{error || 'Unable to load session'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />

        {/* Session Header */}
        <SessionHeader
          taskTitle={session.task?.title}
          isOffline={isOffline}
          isSoundEnabled={isSoundPlaying && currentSound !== 'silent'}
          onClose={handleClose}
          onSoundToggle={() => setShowSoundPanel(true)}
        />

        {/* Background Warning */}
        <BackgroundWarning
          visible={showWarning}
          timeAwayMs={timeAwayMs}
          isSyncing={isSyncing}
          onDismiss={dismissWarning}
        />

        {/* Main Layout: Tree + Timer */}
        <View
          style={[
            styles.mainLayout,
            orientation === 'landscape' ? styles.landscapeLayout : styles.portraitLayout,
          ]}
        >
          {/* Tree Panel with Ambient Animations */}
          <View
            style={[
              styles.treePanelContainer,
              orientation === 'portrait' && styles.treePortrait,
            ]}
          >
            <TreePanel
              ref={treePanelRef}
              backgroundGradient={backgroundGradient}
              progress={treeProgress}
              treeType={treeType}
              orientation={orientation}
              isMobile={true}
            />
            {/* <AmbientAnimations timeOfDay={timeOfDay} enabled={!isPaused} /> */}
          </View>

          {/* Timer Panel */}
          <View
            style={[
              styles.timerContainer,
              orientation === 'landscape' ? styles.timerLandscape : styles.timerPortrait,
            ]}
          >
            <TimerPanel
              sessionId={session.id}
              durationSeconds={session.duration}
              startTime={session.startTime}
              endTime={session.endTime || session.startTime}
              status={session.status}
              timeElapsed={session.timeElapsed}
              taskTitle={session.task?.title}
              taskDescription={session.task?.description}
              onComplete={handleComplete}
              onProgressUpdate={handleProgressUpdate}
              orientation={orientation}
              isMobile={true}
            />
          </View>
        </View>

        {/* Pause Overlay */}
        <PauseOverlay
          visible={isPaused}
          onResume={handleResume}
          isLoading={isResuming}
        />

        {/* Session Notes Drawer */}
        <SessionNotesDrawer
          notes={notes}
          draft={draft}
          canAddNote={canAddNote}
          noteCount={noteCount}
          maxNotes={maxNotes}
          isPro={false}
          onAddNote={handleAddNote}
          onDeleteNote={deleteNote}
          onDraftChange={handleDraftChange}
        />

        {/* Completion Modal */}
        <CompletionModal
          visible={showCompletionModal}
          duration={session.duration}
          treeTier={treeType}
          onViewForest={() => {
            setShowCompletionModal(false);
            router.replace('/(tabs)/forest');
          }}
          onBackToDashboard={() => {
            setShowCompletionModal(false);
            router.replace('/(tabs)');
          }}
        />

        {/* Give Up Modal */}
        <GiveUpModal
          visible={showGiveUpModal}
          elapsedMinutes={elapsedMinutes}
          onKeepGoing={() => setShowGiveUpModal(false)}
          onGiveUp={handleGiveUpConfirm}
        />

        {/* Ambient Sound Panel */}
        <AmbientSoundPanel
          visible={showSoundPanel}
          currentSound={currentSound}
          volume={volume}
          isPlaying={isSoundPlaying}
          availableSounds={availableSounds}
          isPro={false}
          onSelectSound={setSound}
          onVolumeChange={setVolume}
          onTogglePlay={handleSoundToggle}
          onClose={() => setShowSoundPanel(false)}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  mainLayout: {
    flex: 1,
  },
  portraitLayout: {
    flexDirection: 'column',
  },
  landscapeLayout: {
    flexDirection: 'row',
  },
  treePanelContainer: {
    flex: 1,
    position: 'relative',
  },
  timerContainer: {
    backgroundColor: 'transparent',
  },
  timerPortrait: {
    flex: 1.1,
  },
  timerLandscape: {
    flex: 1,
  },
  treePortrait: {
    flex: 0.9,
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    color: COLORS.text.white,
    fontSize: 16,
    marginTop: SPACING.lg,
  },
  errorTitle: {
    color: COLORS.text.white,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginBottom: SPACING.xxl,
    textAlign: 'center',
  },
});
