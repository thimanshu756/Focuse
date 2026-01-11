'use client';

import { motion } from 'framer-motion';
import { TreeCard } from './TreeCard';
import { Session } from '@/types/forest.types';

interface TreeGridProps {
  sessions: Session[];
  onTreeClick: (sessionId: string) => void;
  isLoading?: boolean;
}

// Generate natural forest positions for trees
function generateForestLayout(sessionCount: number) {
  const positions: Array<{ x: number; y: number; depth: number }> = [];
  const rows = Math.ceil(sessionCount / 8);

  for (let i = 0; i < sessionCount; i++) {
    const row = Math.floor(i / 8);
    const col = i % 8;

    // Add some randomness to make it look natural
    const baseX = col * 12.5 + Math.random() * 3;
    const baseY = row * 25 + Math.random() * 8;

    // Depth for layering effect (0-1, where 1 is foreground)
    const depth = 0.4 + Math.random() * 0.6;

    positions.push({
      x: baseX,
      y: baseY,
      depth,
    });
  }

  return positions;
}

export function TreeGrid({
  sessions,
  onTreeClick,
  isLoading = false,
}: TreeGridProps) {
  const layout = generateForestLayout(sessions.length);

  if (isLoading) {
    return (
      <div className="relative w-full min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-text-secondary">Growing your forest...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-x-auto pb-16"
      style={{ overflow: 'visible' }}
    >
      {/* Forest Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-700/30 via-green-600/15 to-transparent pointer-events-none" />

      {/* Grass texture at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-t from-green-800/20 to-transparent" />
      </div>

      {/* Forest Container */}
      <motion.div
        className="relative pt-20 pb-16 px-8 min-h-[500px]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.06) 0%, transparent 50%)
          `,
        }}
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.03,
            },
          },
        }}
      >
        {sessions.map((session, index) => {
          const position = layout[index];
          if (!position) return null;

          return (
            <motion.div
              key={session.id}
              className="absolute"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                zIndex: Math.floor(position.depth * 100),
                opacity: 0.6 + position.depth * 0.4, // Foreground trees more visible
                transform: `scale(${0.7 + position.depth * 0.3})`, // Size based on depth
              }}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 50,
                  scale: 0,
                },
                show: {
                  opacity: 0.6 + position.depth * 0.4,
                  y: 0,
                  scale: 0.7 + position.depth * 0.3,
                  transition: {
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                  },
                },
              }}
            >
              <TreeCard session={session} onClick={onTreeClick} />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Clouds */}
      <motion.div
        className="absolute top-4 right-16 text-2xl opacity-30 pointer-events-none"
        animate={{
          x: [0, 20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        ☁️
      </motion.div>

      <motion.div
        className="absolute top-12 right-48 text-xl opacity-20 pointer-events-none"
        animate={{
          x: [0, -15, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        ☁️
      </motion.div>
    </div>
  );
}
