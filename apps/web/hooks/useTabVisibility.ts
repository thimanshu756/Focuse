import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTabVisibilityReturn {
  focusScore: number;
  distractionCount: number;
  isTabVisible: boolean;
  resetFocusTracking: () => void;
}

/**
 * Hook to track tab visibility and calculate focus score
 * Focus score starts at 100 and decreases by 5 for each distraction (tab switch)
 * Shows warning if user leaves tab for > 30 seconds
 */
export function useTabVisibility(
  enabled: boolean = true,
  onLongAbsence?: () => void
): UseTabVisibilityReturn {
  const [focusScore, setFocusScore] = useState(100);
  const [distractionCount, setDistractionCount] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

  const tabHiddenTimeRef = useRef<number | null>(null);
  const longAbsenceThreshold = 30000; // 30 seconds

  const resetFocusTracking = useCallback(() => {
    setFocusScore(100);
    setDistractionCount(0);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the tab
        setIsTabVisible(false);
        tabHiddenTimeRef.current = Date.now();
      } else {
        // User returned to the tab
        setIsTabVisible(true);

        if (tabHiddenTimeRef.current) {
          const timeAway = Date.now() - tabHiddenTimeRef.current;

          // Count as distraction (decrease focus score)
          setDistractionCount((prev) => prev + 1);
          setFocusScore((prev) => Math.max(0, prev - 5));

          // Show warning if away for > 30 seconds
          if (timeAway > longAbsenceThreshold && onLongAbsence) {
            onLongAbsence();
          }

          tabHiddenTimeRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, onLongAbsence]);

  return {
    focusScore,
    distractionCount,
    isTabVisible,
    resetFocusTracking,
  };
}
