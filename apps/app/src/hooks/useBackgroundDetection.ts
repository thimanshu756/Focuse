/**
 * useBackgroundDetection Hook
 * Detects app background/foreground transitions and tracks time away
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface BackgroundDetectionState {
    isBackground: boolean;
    timeAwayMs: number;
    showWarning: boolean;
}

interface UseBackgroundDetectionOptions {
    warningThresholdMs?: number; // Show warning after this time in background
    warningDurationMs?: number; // Auto-dismiss warning after this time
    onBackground?: () => void;
    onForeground?: (timeAwayMs: number) => void;
}

export function useBackgroundDetection(options: UseBackgroundDetectionOptions = {}) {
    const {
        warningThresholdMs = 30000, // 30 seconds
        warningDurationMs = 5000, // 5 seconds
        onBackground,
        onForeground,
    } = options;

    const [state, setState] = useState<BackgroundDetectionState>({
        isBackground: false,
        timeAwayMs: 0,
        showWarning: false,
    });

    const backgroundTimestamp = useRef<number | null>(null);
    const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const dismissWarning = useCallback(() => {
        setState((prev) => ({ ...prev, showWarning: false }));
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
            warningTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                // App going to background
                backgroundTimestamp.current = Date.now();
                setState((prev) => ({
                    ...prev,
                    isBackground: true,
                }));
                onBackground?.();
            } else if (nextAppState === 'active') {
                // App coming to foreground
                const timeAway = backgroundTimestamp.current
                    ? Date.now() - backgroundTimestamp.current
                    : 0;

                const shouldShowWarning = timeAway >= warningThresholdMs;

                setState({
                    isBackground: false,
                    timeAwayMs: timeAway,
                    showWarning: shouldShowWarning,
                });

                onForeground?.(timeAway);

                // Auto-dismiss warning after specified duration
                if (shouldShowWarning) {
                    if (warningTimeoutRef.current) {
                        clearTimeout(warningTimeoutRef.current);
                    }
                    warningTimeoutRef.current = setTimeout(() => {
                        setState((prev) => ({ ...prev, showWarning: false }));
                    }, warningDurationMs);
                }

                backgroundTimestamp.current = null;
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current);
            }
        };
    }, [warningThresholdMs, warningDurationMs, onBackground, onForeground]);

    return {
        ...state,
        dismissWarning,
    };
}
