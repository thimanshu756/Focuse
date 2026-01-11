'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { TreeAnimation } from '@/components/TreeAnimation';
import { DeadTreeAnimation } from './DeadTreeAnimation';
import { TreeTooltip } from './TreeTooltip';
import { Session } from '@/types/forest.types';
import { formatDuration } from '@/utils/tree-helpers';

interface TreeCardProps {
  session: Session;
  onClick: (sessionId: string) => void;
  style?: React.CSSProperties;
}

function getTreeSize(treeType: 'basic' | 'premium' | 'elite' | 'dead') {
  const sizes = {
    basic: { width: '80px', height: '100px', scale: 0.6 },
    premium: { width: '100px', height: '130px', scale: 0.75 },
    elite: { width: '130px', height: '160px', scale: 0.9 },
    dead: { width: '90px', height: '110px', scale: 0.65 },
  };
  return sizes[treeType];
}

export function TreeCard({ session, onClick, style }: TreeCardProps) {
  const treeType = session.treeType || 'basic';
  const treeSize = getTreeSize(treeType);
  const formattedDate = format(new Date(session.startTime), 'MMM d');
  const formattedDuration = formatDuration(session.duration);
  const isDead = treeType === 'dead';

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      style={{
        width: treeSize.width,
        zIndex: 1,
        ...style,
      }}
      whileHover={{
        scale: isDead ? 1.1 : 1.15,
        zIndex: 100,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={() => onClick(session.id)}
      role="button"
      tabIndex={0}
      aria-label={`View ${isDead ? 'incomplete' : 'completed'} session from ${formattedDate}, duration ${formattedDuration}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(session.id);
        }
      }}
    >
      <TreeTooltip session={session}>
        {/* Tree Visual */}
        <div
          style={{
            width: treeSize.width,
            height: treeSize.height,
          }}
        >
          {isDead ? (
            <DeadTreeAnimation />
          ) : (
            <TreeAnimation progress={100} treeType={treeType} />
          )}
        </div>

        {/* Date label below tree (only visible on hover) */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
        >
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md text-center">
            <p className="text-xs font-medium text-text-primary">
              {formattedDuration}
            </p>
            <p className="text-[10px] text-text-secondary">{formattedDate}</p>
          </div>
        </motion.div>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-full"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{
            background: isDead
              ? 'radial-gradient(circle at center, rgba(107, 114, 128, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(215, 245, 10, 0.2) 0%, transparent 70%)',
            filter: 'blur(20px)',
            transform: 'scale(1.5)',
          }}
        />
      </TreeTooltip>
    </motion.div>
  );
}
