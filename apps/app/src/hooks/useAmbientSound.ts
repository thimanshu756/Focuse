/**
 * useAmbientSound Hook
 * Audio playback with expo-av for ambient sounds during focus sessions
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sound types
export type AmbientSoundType = 'forest' | 'ocean' | 'cafe' | 'birds' | 'silent';

// Sound configuration
interface SoundConfig {
    id: AmbientSoundType;
    label: string;
    isPro: boolean;
    source: any; // Audio source (require statement)
}

// Available sounds
export const AMBIENT_SOUNDS: SoundConfig[] = [
    { id: 'silent', label: 'Silent', isPro: false, source: null },
    { id: 'forest', label: 'Forest', isPro: false, source: null }, // TODO: Add actual audio file
    { id: 'ocean', label: 'Ocean', isPro: true, source: null },
    { id: 'cafe', label: 'Café', isPro: true, source: null },
    { id: 'birds', label: 'Birds', isPro: true, source: null },
];

// Storage key
const SOUND_PREFERENCE_KEY = 'ambient-sound-preference';
const VOLUME_PREFERENCE_KEY = 'ambient-sound-volume';

interface UseAmbientSoundOptions {
    isPro?: boolean;
    sessionActive?: boolean;
}

interface UseAmbientSoundReturn {
    currentSound: AmbientSoundType;
    volume: number;
    isPlaying: boolean;
    isLoading: boolean;
    availableSounds: SoundConfig[];
    setSound: (soundId: AmbientSoundType) => Promise<void>;
    setVolume: (volume: number) => Promise<void>;
    play: () => Promise<void>;
    pause: () => Promise<void>;
    fadeIn: () => Promise<void>;
    fadeOut: () => Promise<void>;
}

export function useAmbientSound(options: UseAmbientSoundOptions = {}): UseAmbientSoundReturn {
    const { isPro = false, sessionActive = true } = options;

    const [currentSound, setCurrentSound] = useState<AmbientSoundType>('silent');
    const [volume, setVolumeState] = useState(0.5);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const soundRef = useRef<Audio.Sound | null>(null);
    const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Filter available sounds based on PRO status
    const availableSounds = AMBIENT_SOUNDS.map((sound) => ({
        ...sound,
        // Mark as available if free or user is PRO
        isPro: sound.isPro && !isPro,
    }));

    // Load saved preferences
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const [savedSound, savedVolume] = await Promise.all([
                    AsyncStorage.getItem(SOUND_PREFERENCE_KEY),
                    AsyncStorage.getItem(VOLUME_PREFERENCE_KEY),
                ]);

                if (savedSound) {
                    // Validate saved sound is valid
                    const isValid = AMBIENT_SOUNDS.some((s) => s.id === savedSound);
                    if (isValid) {
                        setCurrentSound(savedSound as AmbientSoundType);
                    }
                }

                if (savedVolume) {
                    const vol = parseFloat(savedVolume);
                    if (!isNaN(vol) && vol >= 0 && vol <= 1) {
                        setVolumeState(vol);
                    }
                }
            } catch (error) {
                console.error('Failed to load sound preferences:', error);
            }
        };

        loadPreferences();
    }, []);

    // Setup audio mode
    useEffect(() => {
        const setupAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    staysActiveInBackground: true,
                });
            } catch (error) {
                console.error('Failed to setup audio mode:', error);
            }
        };

        setupAudio();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
            if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
            }
        };
    }, []);

    // Load and play sound when currentSound changes
    useEffect(() => {
        const loadSound = async () => {
            if (currentSound === 'silent') {
                if (soundRef.current) {
                    await soundRef.current.stopAsync();
                    await soundRef.current.unloadAsync();
                    soundRef.current = null;
                }
                setIsPlaying(false);
                return;
            }

            const soundConfig = AMBIENT_SOUNDS.find((s) => s.id === currentSound);
            if (!soundConfig?.source) {
                // No audio file available yet
                console.log(`Audio file for ${currentSound} not available`);
                return;
            }

            setIsLoading(true);

            try {
                // Unload previous sound
                if (soundRef.current) {
                    await soundRef.current.unloadAsync();
                }

                // Create and load new sound
                const { sound } = await Audio.Sound.createAsync(
                    soundConfig.source,
                    {
                        isLooping: true,
                        volume,
                        shouldPlay: sessionActive,
                    },
                    onPlaybackStatusUpdate
                );

                soundRef.current = sound;
                setIsPlaying(sessionActive);
            } catch (error) {
                console.error('Failed to load sound:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSound();
    }, [currentSound, sessionActive, volume]);

    // Playback status callback
    const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
        }
    }, []);

    // Set sound and save preference
    const setSound = useCallback(async (soundId: AmbientSoundType) => {
        // Check if PRO sound and user is not PRO
        const soundConfig = AMBIENT_SOUNDS.find((s) => s.id === soundId);
        if (soundConfig?.isPro && !isPro) {
            return; // Don't set PRO sounds for free users
        }

        setCurrentSound(soundId);
        await AsyncStorage.setItem(SOUND_PREFERENCE_KEY, soundId);
    }, [isPro]);

    // Set volume and save preference
    const setVolume = useCallback(async (newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolumeState(clampedVolume);

        if (soundRef.current) {
            await soundRef.current.setVolumeAsync(clampedVolume);
        }

        await AsyncStorage.setItem(VOLUME_PREFERENCE_KEY, clampedVolume.toString());
    }, []);

    // Play sound
    const play = useCallback(async () => {
        if (soundRef.current && currentSound !== 'silent') {
            await soundRef.current.playAsync();
            setIsPlaying(true);
        }
    }, [currentSound]);

    // Pause sound
    const pause = useCallback(async () => {
        if (soundRef.current) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
        }
    }, []);

    // Fade in over 1 second
    const fadeIn = useCallback(async () => {
        if (!soundRef.current || currentSound === 'silent') return;

        // Clear any existing fade
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
        }

        // Start at 0 volume
        await soundRef.current.setVolumeAsync(0);
        await soundRef.current.playAsync();
        setIsPlaying(true);

        // Gradually increase volume
        const steps = 20;
        const interval = 1000 / steps;
        let currentStep = 0;

        fadeIntervalRef.current = setInterval(async () => {
            currentStep++;
            const newVol = (currentStep / steps) * volume;

            if (soundRef.current) {
                await soundRef.current.setVolumeAsync(newVol);
            }

            if (currentStep >= steps) {
                if (fadeIntervalRef.current) {
                    clearInterval(fadeIntervalRef.current);
                    fadeIntervalRef.current = null;
                }
            }
        }, interval);
    }, [currentSound, volume]);

    // Fade out over 1 second
    const fadeOut = useCallback(async () => {
        if (!soundRef.current) return;

        // Clear any existing fade
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
        }

        // Gradually decrease volume
        const steps = 20;
        const interval = 1000 / steps;
        let currentStep = 0;
        const startVolume = volume;

        fadeIntervalRef.current = setInterval(async () => {
            currentStep++;
            const newVol = startVolume * (1 - currentStep / steps);

            if (soundRef.current) {
                await soundRef.current.setVolumeAsync(Math.max(0, newVol));
            }

            if (currentStep >= steps) {
                if (fadeIntervalRef.current) {
                    clearInterval(fadeIntervalRef.current);
                    fadeIntervalRef.current = null;
                }
                if (soundRef.current) {
                    await soundRef.current.pauseAsync();
                    setIsPlaying(false);
                }
            }
        }, interval);
    }, [volume]);

    return {
        currentSound,
        volume,
        isPlaying,
        isLoading,
        availableSounds,
        setSound,
        setVolume,
        play,
        pause,
        fadeIn,
        fadeOut,
    };
}
