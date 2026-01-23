import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseWakeLockResult {
  isSupported: boolean;
  isActive: boolean;
  error: Error | null;
  request: () => Promise<void>;
  release: () => Promise<void>;
}

export function useWakeLock(): UseWakeLockResult {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Check support
  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const request = useCallback(async () => {
    if (!isSupported) {
      return; // Fail silently or handle if needed
    }

    try {
      const wakeLock = await navigator.wakeLock.request('screen');

      wakeLock.addEventListener('release', () => {
        setIsActive(false);
        wakeLockRef.current = null;
      });

      wakeLockRef.current = wakeLock;
      setIsActive(true);
      setError(null);
    } catch (err: any) {
      setError(err);
      setIsActive(false);
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setIsActive(false);
    }
  }, []);

  // Re-request lock when visibility changes (if it was active or intended to be)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === 'visible' &&
        !isActive &&
        wakeLockRef.current === null
      ) {
        // We can't automatically know if we *should* have it,
        // but typically for a session we want it always.
        // However, the browser releases it on visibility change.
        // We should try to request it again IF we are in a state where we want it.
        // For simplicity in this hook, we let the consumer decide when to call request,
        // OR we can auto-re-acquire if we were active before?
        // Actually, the sentinel is released when tab is hidden.
        // So we need to re-request.
        await request();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, request]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      release();
    };
  }, [release]);

  return {
    isSupported,
    isActive,
    error,
    request,
    release,
  };
}
