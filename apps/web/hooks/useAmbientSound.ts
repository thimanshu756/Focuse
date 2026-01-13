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
    key: 'rain',
    label: 'Rain (Gentle)',
    emoji: '🌧️',
    url: '/sounds/rain.mp3',
    isPro: false,
  },
  {
    key: 'forest',
    label: 'Forest (Birds)',
    emoji: '🌲',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_d1718ab41b.mp3',
    isPro: true,
  },
  {
    key: 'cafe',
    label: 'Café Ambience',
    emoji: '☕',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c6e1e02f.mp3',
    isPro: true,
  },
  {
    key: 'lofi',
    label: 'Lo-fi Beats',
    emoji: '🎵',
    url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_5c2d3f8f5e.mp3',
    isPro: true,
  },
  {
    key: 'whitenoise',
    label: 'White Noise',
    emoji: '📻',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_0a0b3b0c3a.mp3',
    isPro: true,
  },
  {
    key: 'ocean',
    label: 'Ocean Waves',
    emoji: '🌊',
    url: 'https://cdn.pixabay.com/download/audio/2022/06/07/audio_24345c8f9e.mp3',
    isPro: true,
  },
];

interface UseAmbientSoundReturn {
  sounds: AmbientSound[];
  isPlaying: boolean;
  activeSound: string | null;
  volume: number;
  toggleSound: (soundKey: string) => void;
  updateVolume: (newVolume: number) => void;
  fadeOut: () => Promise<void>;
  fadeIn: () => Promise<void>;
  stopAll: () => void;
}

export function useAmbientSound(isPro: boolean): UseAmbientSoundReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter sounds based on user tier
  const availableSounds = isPro ? SOUNDS : SOUNDS.filter((s) => !s.isPro);

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setActiveSound(null);
  }, []);

  const toggleSound = useCallback(
    (soundKey: string) => {
      const sound = SOUNDS.find((s) => s.key === soundKey);

      if (!sound) return;

      // Check if user has access to this sound
      if (sound.isPro && !isPro) {
        // Trigger upgrade modal (handled by parent component)
        return;
      }

      // If same sound is playing, stop it
      if (activeSound === soundKey && isPlaying) {
        stopAll();
        return;
      }

      // Stop current sound if any
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Load and play new sound
      try {
        const audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = volume;

        audio.play().catch((error) => {
          console.error('Failed to play audio:', error);
          setIsPlaying(false);
        });

        audioRef.current = audio;
        setActiveSound(soundKey);
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to load audio:', error);
        setIsPlaying(false);
      }
    },
    [activeSound, isPlaying, volume, isPro, stopAll]
  );

  const updateVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  const fadeOut = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!audioRef.current || !isPlaying) {
        resolve();
        return;
      }

      const audio = audioRef.current;
      const startVolume = audio.volume;
      const fadeStep = startVolume / 10;

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      fadeIntervalRef.current = setInterval(() => {
        if (audio.volume > fadeStep) {
          audio.volume = Math.max(0, audio.volume - fadeStep);
        } else {
          audio.volume = 0;
          audio.pause();
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
          }
          resolve();
        }
      }, 100);
    });
  }, [isPlaying]);

  const fadeIn = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!audioRef.current || !activeSound) {
        resolve();
        return;
      }

      const audio = audioRef.current;
      const targetVolume = volume;
      const fadeStep = targetVolume / 10;

      audio.volume = 0;
      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
        resolve();
      });

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      fadeIntervalRef.current = setInterval(() => {
        if (audio.volume < targetVolume - fadeStep) {
          audio.volume = Math.min(targetVolume, audio.volume + fadeStep);
        } else {
          audio.volume = targetVolume;
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
          }
          resolve();
        }
      }, 100);
    });
  }, [activeSound, volume]);

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
    toggleSound,
    updateVolume,
    fadeOut,
    fadeIn,
    stopAll,
  };
}
