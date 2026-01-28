/**
 * useWakeLock Hook
 * Wrapper around expo-keep-awake to prevent screen from sleeping
 */

import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

interface UseWakeLockOptions {
    enabled?: boolean;
    tag?: string;
}

/**
 * Keeps the screen awake while the component is mounted
 * @param options - Configuration options
 * @param options.enabled - Whether wake lock is enabled (default: true)
 * @param options.tag - Unique identifier for this wake lock (default: 'session-wakelock')
 */
export function useWakeLock(options: UseWakeLockOptions = {}) {
    const { enabled = true, tag = 'session-wakelock' } = options;

    useEffect(() => {
        if (!enabled) return;

        // Activate keep awake
        const activate = async () => {
            try {
                await activateKeepAwakeAsync(tag);
            } catch (error) {
                // Silently fail - keep awake is not critical
                console.warn('Failed to activate wake lock:', error);
            }
        };

        activate();

        // Deactivate on unmount
        return () => {
            try {
                deactivateKeepAwake(tag);
            } catch (error) {
                console.warn('Failed to deactivate wake lock:', error);
            }
        };
    }, [enabled, tag]);
}
