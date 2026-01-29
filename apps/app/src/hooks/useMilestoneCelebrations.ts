/**
 * useMilestoneCelebrations Hook
 * Triggers celebrations at focus time milestones
 */

import { useEffect, useRef, useCallback } from 'react';
import { Alert, Vibration } from 'react-native';

// Milestone configuration
const MILESTONES = [
    { minutes: 10, emoji: '🎉', message: "You've focused for 10 minutes!" },
    { minutes: 20, emoji: '💪', message: 'Impressive! 20 minutes of focus!' },
    { minutes: 30, emoji: '🔥', message: 'Amazing! 30 minutes of deep work!' },
    { minutes: 45, emoji: '🌟', message: 'Incredible! 45 minutes of focus!' },
    { minutes: 60, emoji: '🏆', message: 'Champion! A full hour of focus!' },
    { minutes: 90, emoji: '🚀', message: 'Unstoppable! 90 minutes of focus!' },
    { minutes: 120, emoji: '👑', message: 'Legendary! 2 hours of focus!' },
];

interface UseMilestoneCelebrationsOptions {
    elapsedMinutes: number;
    enabled?: boolean;
    onMilestone?: (milestone: { minutes: number; emoji: string; message: string }) => void;
    onTreePulse?: () => void;
}

interface Milestone {
    minutes: number;
    emoji: string;
    message: string;
}

export function useMilestoneCelebrations(options: UseMilestoneCelebrationsOptions) {
    const {
        elapsedMinutes,
        enabled = true,
        onMilestone,
        onTreePulse,
    } = options;

    // Track which milestones have been celebrated
    const celebratedMilestonesRef = useRef<Set<number>>(new Set());

    // Reset celebrated milestones when session restarts
    useEffect(() => {
        if (elapsedMinutes === 0) {
            celebratedMilestonesRef.current.clear();
        }
    }, [elapsedMinutes]);

    // Check for milestone on elapsed time change
    useEffect(() => {
        if (!enabled) return;

        // Find milestone that matches current elapsed time
        const milestone = MILESTONES.find(
            (m) =>
                elapsedMinutes >= m.minutes &&
                !celebratedMilestonesRef.current.has(m.minutes)
        );

        if (milestone) {
            celebrateMilestone(milestone);
            celebratedMilestonesRef.current.add(milestone.minutes);
        }
    }, [elapsedMinutes, enabled]);

    const celebrateMilestone = useCallback(
        (milestone: Milestone) => {
            // Vibrate device
            Vibration.vibrate([0, 100, 50, 100]);

            // Trigger tree pulse animation
            onTreePulse?.();

            // Call custom milestone handler
            onMilestone?.(milestone);

            // Show toast/alert (simple implementation)
            // In production, you might want to use a custom toast component
            showMilestoneToast(milestone);
        },
        [onMilestone, onTreePulse]
    );

    const showMilestoneToast = (milestone: Milestone) => {
        // Using Alert as a simple toast substitute
        // Consider replacing with a proper toast library in production
        Alert.alert(
            `${milestone.emoji} Milestone!`,
            milestone.message,
            [{ text: 'Keep Going! 💪', style: 'default' }],
            {
                cancelable: true,
            }
        );
    };

    // Get next milestone
    const getNextMilestone = useCallback((): Milestone | null => {
        const upcoming = MILESTONES.find((m) => m.minutes > elapsedMinutes);
        return upcoming || null;
    }, [elapsedMinutes]);

    // Get progress to next milestone
    const getProgressToNextMilestone = useCallback((): number => {
        const previousMilestone = [...MILESTONES]
            .reverse()
            .find((m) => m.minutes <= elapsedMinutes);
        const nextMilestone = MILESTONES.find((m) => m.minutes > elapsedMinutes);

        if (!nextMilestone) return 100;

        const start = previousMilestone?.minutes || 0;
        const end = nextMilestone.minutes;
        const progress = ((elapsedMinutes - start) / (end - start)) * 100;

        return Math.min(100, Math.max(0, progress));
    }, [elapsedMinutes]);

    return {
        getNextMilestone,
        getProgressToNextMilestone,
        celebratedMilestones: Array.from(celebratedMilestonesRef.current),
    };
}
