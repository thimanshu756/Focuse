'use client';

import { motion } from 'framer-motion';
import { Pause, Play, Coffee, Music } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface TimerControlsProps {
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED';
  isRequestPending: boolean;
  isOffline: boolean;
  onPause: () => Promise<void>;
  onResume: () => Promise<void>;
  onBreak: () => void;
  onSoundClick?: () => void;
  isSoundPlaying?: boolean;
}

/**
 * Timer control buttons: Pause/Resume and Break
 */
export function TimerControls({
  status,
  isRequestPending,
  isOffline,
  onPause,
  onResume,
  onBreak,
  onSoundClick,
  isSoundPlaying = false,
}: TimerControlsProps) {
  const handlePauseResume = async () => {
    if (isOffline) {
      toast.error("Offline — can't pause right now");
      return;
    }

    if (status === 'RUNNING') {
      await onPause();
    } else if (status === 'PAUSED') {
      await onResume();
    }
  };

  const handleBreak = () => {
    // Placeholder - show toast for now
    toast('Break feature coming soon', {
      icon: '☕',
      duration: 2000,
    });
    onBreak();
  };

  const isDisabled = isRequestPending || status === 'COMPLETED' || isOffline;

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      {/* Primary Control: Pause/Resume */}
      <Button
        variant="primary"
        size="lg"
        onClick={handlePauseResume}
        disabled={isDisabled}
        className="min-w-[200px] md:min-w-[240px] flex items-center justify-center gap-2"
        aria-label={status === 'RUNNING' ? 'Pause session' : 'Resume session'}
      >
        {isRequestPending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Please wait...</span>
          </>
        ) : status === 'RUNNING' ? (
          <>
            <Pause size={20} />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play size={20} />
            <span>Resume</span>
          </>
        )}
      </Button>

      {/* Secondary Controls Row */}
      <div className="flex items-center gap-3 w-full justify-center">
        {/* Sound Button */}
        {onSoundClick && (
          <Button
            variant="ghost"
            size="md"
            onClick={onSoundClick}
            disabled={isRequestPending || status === 'COMPLETED'}
            className={`text-white/80 hover:text-white hover:bg-white/10 min-w-[100px] flex items-center justify-center gap-2 ${
              isSoundPlaying ? 'bg-accent/20 ring-2 ring-accent/30' : ''
            }`}
            aria-label="Background sound"
          >
            <Music size={18} />
            <span className="hidden md:inline">Sound</span>
          </Button>
        )}

        {/* Break Button */}
        {/* <Button
          variant="ghost"
          size="md"
          onClick={handleBreak}
          disabled={isRequestPending || status === 'COMPLETED'}
          className="text-white/80 hover:text-white hover:bg-white/10 min-w-[100px] flex items-center justify-center gap-2"
          aria-label="Take a break"
        >
          <Coffee size={18} />
          <span className="hidden md:inline">Break</span>
        </Button> */}
      </div>
    </div>
  );
}
