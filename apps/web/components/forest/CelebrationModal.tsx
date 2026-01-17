'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Milestone {
  count: number;
  emoji: string;
  title: string;
  message: string;
}

const MILESTONES: Milestone[] = [
  {
    count: 1,
    emoji: '🌱',
    title: 'Your First Tree!',
    message: 'Keep growing your forest, one session at a time!',
  },
  {
    count: 10,
    emoji: '🎉',
    title: '10 Trees Planted!',
    message: 'Your forest is growing! Keep up the great work!',
  },
  {
    count: 25,
    emoji: '🌳',
    title: '25 Trees Strong!',
    message: "You're building a real forest! Incredible progress!",
  },
  {
    count: 50,
    emoji: '🏆',
    title: '50 Trees!',
    message: 'Incredible dedication! Your focus is paying off!',
  },
  {
    count: 100,
    emoji: '🌲',
    title: 'Century Forest!',
    message: '100 trees planted! You are a focus master!',
  },
];

interface CelebrationModalProps {
  sessionCount: number;
}

export function CelebrationModal({ sessionCount }: CelebrationModalProps) {
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(
    null
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const lastMilestone = Number(
      localStorage.getItem('lastForestMilestone') || 0
    );

    // Find the highest milestone we've just reached
    const newMilestone = MILESTONES.filter(
      (m) => sessionCount >= m.count && m.count > lastMilestone
    ).sort((a, b) => b.count - a.count)[0];

    if (newMilestone) {
      setActiveMilestone(newMilestone);
      localStorage.setItem('lastForestMilestone', String(newMilestone.count));
    }
  }, [sessionCount]);

  const handleClose = () => {
    setActiveMilestone(null);
  };

  if (!activeMilestone) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Confetti Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: Math.random() * 360,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: Math.random() * 360 + 360,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 0.5,
                ease: 'linear',
              }}
              className="absolute w-3 h-3"
              style={{
                backgroundColor: [
                  '#D7F50A',
                  '#22C55E',
                  '#FFC107',
                  '#FF4081',
                  '#42A5F5',
                ][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.4 }}
          className="relative w-full max-w-md bg-gradient-to-br from-white to-green-50 rounded-[32px] shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close celebration"
          >
            <X size={20} className="text-text-secondary" />
          </button>

          {/* Content */}
          <div className="p-8 text-center space-y-6">
            {/* Sparkle Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
              className="flex justify-center"
            >
              <div className="p-4 bg-accent rounded-full">
                <Sparkles size={32} className="text-gray-900" />
              </div>
            </motion.div>

            {/* Emoji */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
              className="text-7xl"
            >
              {activeMilestone.emoji}
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold text-text-primary mb-3">
                {activeMilestone.title}
              </h2>
              <p className="text-base text-text-secondary max-w-sm mx-auto">
                {activeMilestone.message}
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 rounded-2xl p-6"
            >
              <p className="text-4xl font-bold text-green-600 mb-2">
                {activeMilestone.count}
              </p>
              <p className="text-sm font-medium text-text-secondary">
                Focus Sessions Completed
              </p>
            </motion.div>

            {/* Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={handleClose}
                className="w-full"
              >
                Continue Growing 🌱
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
