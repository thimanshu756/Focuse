'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Music } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useEffect } from 'react';
interface AmbientSound {
  key: string;
  label: string;
  emoji: string;
  url: string;
  isPro: boolean;
}

interface AmbientSoundPanelProps {
  sounds: AmbientSound[];
  activeSound: string | null;
  isPlaying: boolean;
  volume: number;
  isPro: boolean;
  audioError: string | null;
  onToggleSound: (soundKey: string) => void;
  onVolumeChange: (volume: number) => void;
  onClose: () => void;
  onEnableAudio?: () => Promise<void>;
  onUpgradeClick?: () => void;
}

/**
 * Ambient sound panel with FREE vs PRO gating
 */
export function AmbientSoundPanel({
  sounds,
  activeSound,
  isPlaying,
  volume,
  isPro,
  audioError,
  onToggleSound,
  onVolumeChange,
  onClose,
  onEnableAudio,
  onUpgradeClick,
}: AmbientSoundPanelProps) {
  const freeSounds = sounds.filter((s) => !s.isPro);
  const proSounds = sounds.filter((s) => s.isPro);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-label="Close sound panel"
      />

      {/* Panel */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-4 md:right-6 w-[320px] md:w-[360px] bg-black/40 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Music size={20} />
              Background Sound{isPro ? 's' : ''}
            </h3>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
              aria-label="Close sound panel"
            >
              <X size={20} />
            </button>
          </div>

          {/* Audio Error Message */}
          {audioError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl"
            >
              <p className="text-sm text-yellow-200 mb-2">{audioError}</p>
              {onEnableAudio && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onEnableAudio}
                  className="w-full"
                >
                  Enable Audio
                </Button>
              )}
            </motion.div>
          )}

          {/* FREE Sounds */}
          <div className="space-y-2 mb-4">
            {freeSounds.map((sound) => (
              <button
                key={sound.key}
                onClick={() => onToggleSound(sound.key)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  activeSound === sound.key
                    ? 'bg-accent/30 text-white ring-2 ring-accent/50'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
                aria-label={`Select ${sound.label}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{sound.emoji}</span>
                  <span className="flex-1 font-medium">{sound.label}</span>
                  {activeSound === sound.key && isPlaying && (
                    <span className="text-xs text-accent font-medium">
                      Playing
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* PRO Sounds or Upgrade Prompt */}
          {!isPro && proSounds.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-400/30">
              <p className="text-sm text-yellow-100 mb-3 text-center">
                ⭐ Unlock {proSounds.length} more ambient sounds with PRO
              </p>
              {onUpgradeClick && (
                <Button
                  onClick={onUpgradeClick}
                  variant="primary"
                  size="sm"
                  className="w-full"
                >
                  Upgrade to PRO
                </Button>
              )}
            </div>
          )}

          {isPro && proSounds.length > 0 && (
            <div className="border-t border-white/20 pt-4 mb-4">
              <p className="text-xs text-white/50 mb-2 uppercase tracking-wide">
                PRO Sounds
              </p>
              <div className="space-y-2">
                {proSounds.map((sound) => (
                  <button
                    key={sound.key}
                    onClick={() => onToggleSound(sound.key)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      activeSound === sound.key
                        ? 'bg-yellow-500/30 text-white ring-2 ring-yellow-400/50'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                    aria-label={`Select ${sound.label}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{sound.emoji}</span>
                      <span className="flex-1 font-medium">{sound.label}</span>
                      {activeSound === sound.key && isPlaying && (
                        <span className="text-xs text-yellow-300 font-medium">
                          Playing
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Volume Slider */}
          {(isPlaying || activeSound) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/20"
            >
              <div className="flex items-center gap-3 mb-2">
                <Volume2 size={16} className="text-white/60" />
                <label
                  className="text-sm text-white/60 flex-1"
                  htmlFor="volume-slider"
                >
                  Volume
                </label>
                <span className="text-sm text-white font-medium">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                id="volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #D7F50A 0%, #D7F50A ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`,
                }}
                aria-label="Volume control"
              />
            </motion.div>
          )}

          {/* Now Playing Indicator */}
          {isPlaying && activeSound && (
            <div className="mt-4 text-xs text-white/50 text-center">
              Now playing: {sounds.find((s) => s.key === activeSound)?.label}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
