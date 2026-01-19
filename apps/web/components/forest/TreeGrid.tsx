'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TreeCard } from './TreeCard';
import { Session } from '@/types/forest.types';

interface TreeGridProps {
  sessions: Session[];
  onTreeClick: (sessionId: string) => void;
  isLoading?: boolean;
}

// Responsive cell dimensions based on viewport
function getCellDimensions(viewportWidth: number) {
  if (viewportWidth < 640) {
    // Mobile: smaller cells for compact layout
    return { width: 100, height: 140 };
  } else if (viewportWidth < 1024) {
    // Tablet: medium cells
    return { width: 140, height: 160 };
  } else {
    // Desktop: larger cells
    return { width: 160, height: 180 };
  }
}

// Calculate optimal grid layout based on tree count and viewport
function calculateGridLayout(
  sessionCount: number,
  viewportWidth: number = 1024
) {
  if (sessionCount === 0)
    return { cols: 0, rows: 0, cellWidth: 160, cellHeight: 180 };

  const cellDimensions = getCellDimensions(viewportWidth);

  // Determine base columns based on viewport size
  let baseCols: number;
  if (viewportWidth < 640) {
    baseCols = 3; // Mobile: 3 columns for better grid appearance
  } else if (viewportWidth < 1024) {
    baseCols = 4; // Tablet: 4 columns
  } else if (viewportWidth < 1440) {
    baseCols = 5; // Desktop: 5 columns
  } else {
    baseCols = 6; // Large desktop: 6 columns
  }

  // Calculate how many cells we can fit given minimum cell width
  const availableWidth = viewportWidth - 32; // Account for padding (16px each side)
  const maxColsByWidth = Math.floor(availableWidth / cellDimensions.width);

  // Use the smaller of baseCols and maxColsByWidth to ensure cells aren't too small
  const cols = Math.max(2, Math.min(baseCols, maxColsByWidth, sessionCount));

  // Calculate rows needed
  const rows = Math.ceil(sessionCount / cols);

  return {
    cols,
    rows,
    cellWidth: cellDimensions.width,
    cellHeight: cellDimensions.height,
  };
}

// Calculate container height based on grid layout
function calculateContainerHeight(rows: number, cellHeight: number): number {
  // Each row needs cellHeight + gap
  const rowHeight = cellHeight + 16; // 16px gap between rows
  const baseHeight = 40; // Top padding (reduced)
  const bottomHeight = 60; // Bottom padding (reduced)

  return Math.max(300, baseHeight + rows * rowHeight + bottomHeight);
}

export function TreeGrid({
  sessions,
  onTreeClick,
  isLoading = false,
}: TreeGridProps) {
  // Calculate grid layout based on viewport width (using client-side)
  const [gridLayout, setGridLayout] = React.useState({
    cols: 4,
    rows: 1,
    cellWidth: 160,
    cellHeight: 180,
  });

  React.useEffect(() => {
    function updateLayout() {
      const viewportWidth = window.innerWidth;
      const layout = calculateGridLayout(sessions.length, viewportWidth);
      setGridLayout(layout);
    }

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [sessions.length]);

  const containerHeight = calculateContainerHeight(
    gridLayout.rows,
    gridLayout.cellHeight
  );

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

  if (sessions.length === 0) {
    return (
      <div className="relative w-full min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-text-secondary">No trees planted yet</p>
          <p className="text-sm text-text-muted mt-2">
            Complete focus sessions to grow your forest
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden pb-16"
      style={{ minHeight: `${containerHeight}px` }}
    >
      {/* Forest Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-700/30 via-green-600/15 to-transparent pointer-events-none" />

      {/* Grass texture at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-t from-green-800/20 to-transparent" />
      </div>

      {/* Forest Grid Container */}
      <motion.div
        className="relative pt-12 pb-12 px-4 sm:pt-16 sm:pb-16 sm:px-8"
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
              staggerChildren: 0.05,
            },
          },
        }}
      >
        {/* CSS Grid for tree layout */}
        <div
          className="grid w-full max-w-7xl mx-auto"
          style={{
            gridTemplateColumns: `repeat(${gridLayout.cols}, minmax(${gridLayout.cellWidth}px, 1fr))`,
            gridAutoRows: `minmax(${gridLayout.cellHeight}px, auto)`,
            gap: '16px',
          }}
        >
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              className="flex items-center justify-center hover:z-10 relative"
              variants={{
                hidden: {
                  opacity: 0,
                  y: 50,
                  scale: 0,
                },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                  },
                },
              }}
            >
              <div className="scale-75 sm:scale-90 md:scale-100">
                <TreeCard session={session} onClick={onTreeClick} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Clouds */}
      <motion.div
        className="absolute top-4 right-16 text-2xl opacity-30 pointer-events-none hidden sm:block"
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
        className="absolute top-12 right-48 text-xl opacity-20 pointer-events-none hidden md:block"
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
