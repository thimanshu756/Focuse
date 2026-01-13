'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseMilestoneCelebrationsProps {
  elapsedMinutes: number;
  durationMinutes: number;
  onTreePulse?: () => void;
  reducedMotion?: boolean;
}

/**
 * Hook to track and celebrate milestones during a session
 * Celebrates at 10, 20, 30, 40, 50... minute marks
 */
export function useMilestoneCelebrations({
  elapsedMinutes,
  durationMinutes,
  onTreePulse,
  reducedMotion = false,
}: UseMilestoneCelebrationsProps) {
  const [celebratedMilestones, setCelebratedMilestones] = useState<Set<number>>(
    new Set()
  );
  const lastCelebrationTimeRef = useRef<number>(0);
  const RATE_LIMIT_MS = 1000; // Max one celebration per second

  // Calculate milestones based on session duration
  const getMilestones = useCallback((): number[] => {
    const milestones: number[] = [];

    // For very short sessions (<10 min), no milestones
    if (durationMinutes < 10) {
      return [];
    }

    // For sessions >= 10 min, celebrate at 10, 20, 30, 40, 50...
    for (let i = 10; i <= durationMinutes; i += 10) {
      milestones.push(i);
    }

    return milestones;
  }, [durationMinutes]);

  // Get milestone message
  const getMilestoneMessage = useCallback((minutes: number): string => {
    const messages: Record<number, string> = {
      10: '🎉 10 minutes! Great start!',
      20: "💪 20 minutes! You're in the zone!",
      30: '🔥 30 minutes! Deep focus unlocked!',
      40: '⭐ 40 minutes! Almost there!',
      50: '🚀 50 minutes! Incredible focus!',
      60: "🌟 60 minutes! You're a focus champion!",
    };

    return messages[minutes] || `🎯 ${minutes} minutes! Keep going!`;
  }, []);

  // Check and celebrate milestones
  useEffect(() => {
    const milestones = getMilestones();
    if (milestones.length === 0) return;

    const now = Date.now();

    // Rate limiting: don't fire more than one per second
    if (now - lastCelebrationTimeRef.current < RATE_LIMIT_MS) {
      return;
    }

    // Find milestones that have been reached but not yet celebrated
    const reachedMilestones = milestones.filter(
      (milestone) =>
        elapsedMinutes >= milestone && !celebratedMilestones.has(milestone)
    );

    if (reachedMilestones.length === 0) return;

    // If multiple milestones reached (e.g., due to time jump), celebrate the largest one
    const milestoneToCelebrate = Math.max(...reachedMilestones);

    // Mark as celebrated
    setCelebratedMilestones((prev) => {
      const next = new Set(prev);
      next.add(milestoneToCelebrate);
      return next;
    });

    // Show toast
    toast.success(getMilestoneMessage(milestoneToCelebrate), {
      duration: 3000,
      position: 'top-right',
      icon: '🎉',
    });

    // Trigger tree pulse (if not reduced motion)
    if (!reducedMotion && onTreePulse) {
      onTreePulse();
    }

    lastCelebrationTimeRef.current = now;
  }, [
    elapsedMinutes,
    durationMinutes,
    getMilestones,
    getMilestoneMessage,
    celebratedMilestones,
    onTreePulse,
    reducedMotion,
  ]);

  // Reset celebrated milestones when session changes
  useEffect(() => {
    setCelebratedMilestones(new Set());
  }, [durationMinutes]);
}
