'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
  onToggleSound: (soundKey: string) => void;
  onVolumeChange: (volume: number) => void;
  onClose: () => void;
  onUpgradeClick?: () => void;
}

export function AmbientSoundPanel({
  sounds,
  activeSound,
  isPlaying,
  volume,
  isPro,
  onToggleSound,
  onVolumeChange,
  onClose,
  onUpgradeClick,
}: AmbientSoundPanelProps) {
  const freeSounds = sounds.filter((s) => !s.isPro);
  const proSounds = sounds.filter((s) => s.isPro);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute top-20 right-6 w-80 bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🎵 Background Sound{isPro ? 's' : ''}
          </h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label="Close sound panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* FREE sounds */}
        <div className="space-y-2 mb-4">
          {freeSounds.map((sound) => (
            <button
              key={sound.key}
              onClick={() => onToggleSound(sound.key)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                activeSound === sound.key
                  ? 'bg-green-500/30 text-white ring-2 ring-green-400/50'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{sound.emoji}</span>
                <span className="flex-1">{sound.label}</span>
                {activeSound === sound.key && isPlaying && (
                  <span className="text-xs text-green-300">Playing</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* PRO sounds or upgrade prompt */}
        {!isPro && proSounds.length > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-400/30">
            <p className="text-sm text-yellow-100 mb-3 text-center">
              ⭐ Unlock {proSounds.length} more ambient sounds with PRO
            </p>
            <Button
              onClick={onUpgradeClick}
              variant="primary"
              size="sm"
              className="w-full"
            >
              Upgrade to PRO
            </Button>
          </div>
        )}

        {isPro && proSounds.length > 0 && (
          <>
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
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{sound.emoji}</span>
                      <span className="flex-1">{sound.label}</span>
                      {activeSound === sound.key && isPlaying && (
                        <span className="text-xs text-yellow-300">Playing</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Volume Slider */}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <Volume2 size={16} className="text-white/60" />
              <label className="text-sm text-white/60 flex-1">Volume</label>
              <span className="text-sm text-white font-medium">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #22C55E 0%, #22C55E ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
          </motion.div>
        )}

        {/* Tip */}
        <div className="mt-4 text-xs text-white/40 text-center">
          💡 Audio fades during pause
        </div>
      </motion.div>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-label="Close sound panel"
      />
    </AnimatePresence>
  );
}
