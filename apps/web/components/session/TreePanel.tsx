'use client';

import { ReactNode, useState, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { TreeAnimation } from '@/components/TreeAnimation';

interface TreePanelProps {
  children?: ReactNode;
  backgroundGradient: string;
  progress?: number; // Progress 0-100 for tree growth
  treeType?: 'basic' | 'premium' | 'elite'; // Tree tier based on duration
  isWithering?: boolean; // For give up flow
  isCelebrating?: boolean; // For completion flow
  orientation?: 'portrait' | 'landscape'; // Mobile orientation
  isMobile?: boolean; // Is mobile device
}

export interface TreePanelRef {
  pulse: () => void;
  glow: () => void;
  wither: () => void;
}

/**
 * Left panel container for tree visualization
 * Desktop: 40% width, full height
 * Mobile: 100% width, 40% height
 */
export const TreePanel = forwardRef<TreePanelRef, TreePanelProps>(
  (
    {
      children,
      backgroundGradient,
      progress = 0,
      treeType = 'basic',
      isWithering = false,
      isCelebrating = false,
      orientation = 'portrait',
      isMobile = false,
    },
    ref
  ) => {
    const [pulseKey, setPulseKey] = useState(0);
    const [glowKey, setGlowKey] = useState(0);
    const [witherKey, setWitherKey] = useState(0);

    useImperativeHandle(ref, () => ({
      pulse: () => {
        setPulseKey((prev) => prev + 1);
      },
      glow: () => {
        setGlowKey((prev) => prev + 1);
      },
      wither: () => {
        setWitherKey((prev) => prev + 1);
      },
    }));

    // Dynamic sizing based on orientation and screen size
    const getContainerClasses = () => {
      if (!isMobile) {
        return 'relative h-[calc(100vh-0px)] w-full lg:w-[40%] flex items-center justify-center overflow-hidden p-5 lg:p-10';
      }

      if (orientation === 'landscape') {
        // Landscape: side-by-side (50% width, full height)
        return 'relative h-[calc(100vh-60px)] w-1/2 flex items-center justify-center overflow-hidden p-4';
      } else {
        // Portrait: stacked (full width, 45% height - more tree visible)
        return 'relative h-[45vh] w-full flex items-center justify-center overflow-hidden p-6';
      }
    };

    // Dynamic tree scale based on orientation
    const getTreeScale = () => {
      if (!isMobile) {
        return 'scale-150 md:scale-[1.8] lg:scale-[2]';
      }

      if (orientation === 'landscape') {
        // Landscape: smaller tree to fit side-by-side
        return 'scale-[1.1]';
      } else {
        // Portrait: larger tree for prominence
        return 'scale-[0.95]';
      }
    };

    return (
      <div
        className={getContainerClasses()}
        style={{ background: backgroundGradient }}
      >
        {/* Ambient Animations - Behind tree */}
        {children && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {children}
          </div>
        )}

        {/* Tree Animation - Always render on top */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <motion.div
            key={`pulse-${pulseKey}`}
            className={`${getTreeScale()} origin-center`}
            animate={
              pulseKey > 0
                ? {
                    scale: [1, 1.1, 1],
                  }
                : {}
            }
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
          >
            <motion.div
              key={`glow-${glowKey}`}
              animate={
                glowKey > 0 || isCelebrating
                  ? {
                      filter: [
                        'drop-shadow(0 0 0px rgba(215, 245, 10, 0))',
                        'drop-shadow(0 0 20px rgba(215, 245, 10, 0.6))',
                        'drop-shadow(0 0 0px rgba(215, 245, 10, 0))',
                      ],
                    }
                  : isWithering || witherKey > 0
                    ? {
                        filter: [
                          'brightness(1)',
                          'brightness(0.5)',
                          'brightness(0.3)',
                        ],
                        opacity: [1, 0.7, 0.5],
                      }
                    : {}
              }
              transition={{
                duration: glowKey > 0 || isCelebrating ? 1.5 : 2,
                ease: 'easeInOut',
                repeat: isCelebrating ? Infinity : 0,
                repeatDelay: isCelebrating ? 0.5 : 0,
              }}
            >
              <TreeAnimation
                progress={Math.max(progress, 0)}
                treeType={treeType}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }
);

TreePanel.displayName = 'TreePanel';
