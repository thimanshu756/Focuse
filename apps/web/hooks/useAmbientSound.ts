'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AmbientSound {
  key: string;
  label: string;
  emoji: string;
  url: string;
  isPro: boolean;
}

const SOUNDS: AmbientSound[] = [
  {
    key: 'forest',
    label: 'Forest (Birds)',
    emoji: '🌲',
    url: '/audio/forest.mp3',
    isPro: false, // FREE users get forest as the default
  },
  {
    key: 'ocean',
    label: 'Ocean Waves',
    emoji: '🌊',
    url: '/audio/ocean.mp3',
    isPro: true,
  },
  {
    key: 'cafe',
    label: 'Café Ambience',
    emoji: '☕',
    url: '/audio/cafe.mp3',
    isPro: true,
  },
  {
    key: 'birds',
    label: 'Birds Chirping',
    emoji: '🐦',
    url: '/audio/birds.mp3',
    isPro: true,
  },
  {
    key: 'silent',
    label: 'Silent',
    emoji: '🔇',
    url: '/audio/silent.mp3',
    isPro: false, // Available to all
  },
];

interface SoundPreferences {
  soundEnabled: boolean;
  selectedTrack: string;
  volume: number;
}

const STORAGE_KEY = 'ambientSoundPreferences';
const DEFAULT_PREFERENCES: SoundPreferences = {
  soundEnabled: false,
  selectedTrack: 'forest',
  volume: 0.4,
};

interface UseAmbientSoundReturn {
  sounds: AmbientSound[];
  isPlaying: boolean;
  activeSound: string | null;
  volume: number;
  soundEnabled: boolean;
  audioError: string | null;
  toggleSound: (soundKey: string) => void;
  updateVolume: (newVolume: number) => void;
  fadeOut: () => Promise<void>;
  fadeIn: () => Promise<void>;
  stopAll: () => void;
  enableAudio: () => Promise<void>;
  loadPreferences: () => SoundPreferences;
  savePreferences: (prefs: Partial<SoundPreferences>) => void;
}

/**
 * Ambient sound hook with persistence, fade, and autoplay handling
 */
export function useAmbientSound(isPro: boolean): UseAmbientSoundReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFadingRef = useRef(false);
  const userInteractedRef = useRef(false);

  // Load preferences from localStorage
  const loadPreferences = useCallback((): SoundPreferences => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          soundEnabled: parsed.soundEnabled ?? false,
          selectedTrack: parsed.selectedTrack ?? 'forest',
          volume: parsed.volume ?? 0.4,
        };
      }
    } catch (error) {
      console.error('Failed to load sound preferences:', error);
    }

    return DEFAULT_PREFERENCES;
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback(
    (prefs: Partial<SoundPreferences>) => {
      if (typeof window === 'undefined') return;

      try {
        const current = loadPreferences();
        const updated = { ...current, ...prefs };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save sound preferences:', error);
      }
    },
    [loadPreferences]
  );

  // Initialize from localStorage (but don't auto-play)
  useEffect(() => {
    const prefs = loadPreferences();
    setSoundEnabled(prefs.soundEnabled);
    setActiveSound(prefs.selectedTrack);

    // If sound was enabled, prepare audio but don't play (autoplay restriction)
    if (
      prefs.soundEnabled &&
      prefs.selectedTrack &&
      prefs.selectedTrack !== 'silent'
    ) {
      const sound = SOUNDS.find((s) => s.key === prefs.selectedTrack);
      if (sound) {
        try {
          // Use absolute URL
          const audioUrl = sound.url.startsWith('/')
            ? `${window.location.origin}${sound.url}`
            : sound.url;

          const audio = new Audio(audioUrl);
          audio.loop = true;
          audio.volume = 0; // Start at 0
          audio.preload = 'auto';

          audio.addEventListener('error', () => {
            console.error('Audio load error on init:', audio.error);
          });

          audioRef.current = audio;
          // Don't play - wait for user interaction or session resume
        } catch (error) {
          console.error('Failed to load audio:', error);
        }
      }
    }
  }, [loadPreferences]);

  // Filter sounds based on user tier
  const availableSounds = isPro
    ? SOUNDS
    : SOUNDS.filter((s) => !s.isPro || s.key === 'silent');

  // Get volume from preferences
  const [volume, setVolumeState] = useState(() => {
    const prefs = loadPreferences();
    return prefs.volume;
  });

  const updateVolume = useCallback(
    (newVolume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      setVolumeState(clampedVolume);
      savePreferences({ volume: clampedVolume });

      if (audioRef.current && isPlaying) {
        audioRef.current.volume = clampedVolume;
      }
    },
    [isPlaying, savePreferences]
  );

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setActiveSound(null);
    setSoundEnabled(false);
    savePreferences({ soundEnabled: false });
  }, [savePreferences]);

  const fadeOut = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!audioRef.current || !isPlaying || isFadingRef.current) {
        resolve();
        return;
      }

      isFadingRef.current = true;
      const audio = audioRef.current;
      const startVolume = audio.volume;
      const fadeDuration = 400; // 400ms fade
      const steps = 20;
      const stepTime = fadeDuration / steps;
      const stepVolume = startVolume / steps;

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      let currentStep = 0;
      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        if (currentStep < steps) {
          audio.volume = Math.max(0, startVolume - stepVolume * currentStep);
        } else {
          audio.volume = 0;
          audio.pause();
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          isFadingRef.current = false;
          resolve();
        }
      }, stepTime);
    });
  }, [isPlaying]);

  const fadeIn = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!audioRef.current || !activeSound || isFadingRef.current) {
        resolve();
        return;
      }

      isFadingRef.current = true;
      const audio = audioRef.current;
      const targetVolume = volume;
      const fadeDuration = 500; // 500ms fade
      const steps = 25;
      const stepTime = fadeDuration / steps;
      const stepVolume = targetVolume / steps;

      audio.volume = 0;

      audio
        .play()
        .then(() => {
          setIsPlaying(true);

          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
          }

          let currentStep = 0;
          fadeIntervalRef.current = setInterval(() => {
            currentStep++;
            if (currentStep < steps) {
              audio.volume = Math.min(targetVolume, stepVolume * currentStep);
            } else {
              audio.volume = targetVolume;
              if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;
              }
              isFadingRef.current = false;
              resolve();
            }
          }, stepTime);
        })
        .catch((error) => {
          console.error('Failed to play audio during fade in:', error);
          setAudioError('Tap to enable audio');
          setIsPlaying(false);
          isFadingRef.current = false;
          resolve();
        });
    });
  }, [activeSound, volume]);

  const enableAudio = useCallback(async (): Promise<void> => {
    userInteractedRef.current = true;
    setAudioError(null);

    // If no active sound, use the default or last selected from preferences
    const prefs = loadPreferences();
    const soundToPlay = activeSound || prefs.selectedTrack || 'forest';

    // If audio doesn't exist or wrong track, create/load it
    const sound = SOUNDS.find((s) => s.key === soundToPlay);
    if (!sound) {
      setAudioError('Sound unavailable');
      return;
    }

    // Check PRO access
    if (sound.isPro && !isPro) {
      setAudioError('Upgrade to PRO to unlock this sound');
      return;
    }

    // Create new audio element if needed
    if (!audioRef.current || activeSound !== soundToPlay) {
      // Clean up old audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      try {
        // Use absolute URL to ensure correct path
        const audioUrl = sound.url.startsWith('/')
          ? `${window.location.origin}${sound.url}`
          : sound.url;

        const audio = new Audio(audioUrl);
        audio.loop = true;
        audio.volume = 0; // Start at 0 for fade in
        audio.preload = 'auto';

        // Handle load errors
        const handleError = () => {
          console.error('Audio load error:', audio.error);
          setAudioError('Audio unavailable');
          setIsPlaying(false);
          audioRef.current = null;
        };

        audio.addEventListener('error', handleError);
        audio.addEventListener('canplaythrough', () => {
          // Audio is ready
          setAudioError(null);
        });

        audioRef.current = audio;
        setActiveSound(soundToPlay);
        setSoundEnabled(true);
        savePreferences({
          soundEnabled: true,
          selectedTrack: soundToPlay,
        });
      } catch (error) {
        console.error('Failed to create audio element:', error);
        setAudioError('Audio unavailable');
        return;
      }
    }

    // Now try to play with fade in
    if (audioRef.current) {
      try {
        const audio = audioRef.current;
        audio.volume = 0; // Start at 0

        await audio.play();
        setIsPlaying(true);

        // Fade in after starting playback
        const targetVolume = volume;
        const fadeDuration = 500;
        const steps = 25;
        const stepTime = fadeDuration / steps;
        const stepVolume = targetVolume / steps;

        let currentStep = 0;
        const fadeInterval = setInterval(() => {
          currentStep++;
          if (currentStep < steps) {
            audio.volume = Math.min(targetVolume, stepVolume * currentStep);
          } else {
            audio.volume = targetVolume;
            clearInterval(fadeInterval);
          }
        }, stepTime);
      } catch (error: any) {
        console.error('Failed to enable audio:', error);
        if (
          error.name === 'NotAllowedError' ||
          error.name === 'NotSupportedError'
        ) {
          setAudioError('Tap to enable audio');
        } else {
          setAudioError('Audio unavailable');
        }
        setIsPlaying(false);
      }
    }
  }, [activeSound, isPro, volume, loadPreferences, savePreferences]);

  const toggleSound = useCallback(
    async (soundKey: string) => {
      const sound = SOUNDS.find((s) => s.key === soundKey);
      if (!sound) return;

      // Check if user has access to this sound
      if (sound.isPro && !isPro) {
        // Return early - parent component will show upgrade modal
        return;
      }

      // Mark user as interacted
      userInteractedRef.current = true;
      setAudioError(null);

      // If same sound is playing, stop it
      if (activeSound === soundKey && isPlaying) {
        await fadeOut();
        stopAll();
        return;
      }

      // If switching tracks, fade out current first
      if (audioRef.current && isPlaying && activeSound !== soundKey) {
        await fadeOut();
      }

      // Stop current sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      // If selecting silent, just stop
      if (soundKey === 'silent') {
        stopAll();
        return;
      }

      // Load and prepare new sound
      try {
        // Use absolute URL to ensure correct path
        const audioUrl = sound.url.startsWith('/')
          ? `${window.location.origin}${sound.url}`
          : sound.url;

        const audio = new Audio(audioUrl);
        audio.loop = true;
        audio.volume = 0; // Start at 0 for fade in
        audio.preload = 'auto';

        // Handle load errors
        const handleError = () => {
          console.error('Audio load error:', audio.error);
          setAudioError('Audio unavailable');
          setIsPlaying(false);
          audioRef.current = null;
        };

        audio.addEventListener('error', handleError);
        audio.addEventListener('canplaythrough', () => {
          // Audio is ready
          setAudioError(null);
        });

        audioRef.current = audio;
        setActiveSound(soundKey);
        setSoundEnabled(true);
        savePreferences({
          soundEnabled: true,
          selectedTrack: soundKey,
        });

        // Try to play with fade in
        try {
          await audio.play();
          setIsPlaying(true);
          await fadeIn();
        } catch (error: any) {
          // Autoplay restriction
          if (
            error.name === 'NotAllowedError' ||
            error.name === 'NotSupportedError'
          ) {
            setAudioError('Tap to enable audio');
            setIsPlaying(false);
          } else {
            console.error('Failed to play audio:', error);
            setAudioError('Audio unavailable');
            setIsPlaying(false);
          }
        }
      } catch (error) {
        console.error('Failed to load audio:', error);
        setAudioError('Audio unavailable');
        setIsPlaying(false);
      }
    },
    [activeSound, isPlaying, isPro, fadeOut, fadeIn, stopAll, savePreferences]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    sounds: availableSounds,
    isPlaying,
    activeSound,
    volume,
    soundEnabled,
    audioError,
    toggleSound,
    updateVolume,
    fadeOut,
    fadeIn,
    stopAll,
    enableAudio,
    loadPreferences,
    savePreferences,
  };
}
