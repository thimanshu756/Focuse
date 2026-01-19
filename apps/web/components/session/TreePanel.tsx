'use client';

import {
  ReactNode,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { motion } from 'framer-motion';
import { TreeAnimation } from '@/components/TreeAnimation';

interface TreePanelProps {
  children?: ReactNode;
  backgroundGradient: string;
  progress?: number; // Progress 0-100 for tree growth
  treeType?: 'basic' | 'premium' | 'elite'; // Tree tier based on duration
  isWithering?: boolean; // For give up flow
  isCelebrating?: boolean; // For completion flow
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

    return (
      <div
        className="relative h-[calc(40vh-24px)] lg:h-[calc(100vh-0px)] w-full lg:w-[40%] flex items-center justify-center overflow-hidden p-5 lg:p-10"
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
            className="scale-150 md:scale-[1.8] lg:scale-[2] origin-center"
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
