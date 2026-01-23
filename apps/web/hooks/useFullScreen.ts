import { useState, useEffect, useCallback } from 'react';

export interface UseFullScreenResult {
  isFullscreen: boolean;
  toggleFullScreen: () => Promise<void>;
  enterFullScreen: () => Promise<void>;
  exitFullScreen: () => Promise<void>;
  isEnabled: boolean;
}

export function useFullScreen(): UseFullScreenResult {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsEnabled(document.fullscreenEnabled);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Initial check
    setIsFullscreen(!!document.fullscreenElement);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const enterFullScreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.error('Failed to enter fullscreen:', e);
    }
  }, []);

  const exitFullScreen = useCallback(async () => {
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.error('Failed to exit fullscreen:', e);
    }
  }, []);

  const toggleFullScreen = useCallback(async () => {
    if (!!document.fullscreenElement) {
      await exitFullScreen();
    } else {
      await enterFullScreen();
    }
  }, [enterFullScreen, exitFullScreen]);

  return {
    isFullscreen,
    toggleFullScreen,
    enterFullScreen,
    exitFullScreen,
    isEnabled,
  };
}
