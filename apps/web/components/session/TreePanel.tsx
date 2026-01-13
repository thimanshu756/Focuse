'use client';

import { ReactNode } from 'react';
import { TreeAnimation } from '@/components/TreeAnimation';

interface TreePanelProps {
  children?: ReactNode;
  backgroundGradient: string;
  progress?: number; // Progress 0-100 for tree growth
  treeType?: 'basic' | 'premium' | 'elite'; // Tree tier based on duration
}

/**
 * Left panel container for tree visualization
 * Desktop: 40% width, full height
 * Mobile: 100% width, 40% height
 */
export function TreePanel({
  children,
  backgroundGradient,
  progress = 0,
  treeType = 'basic',
}: TreePanelProps) {
  return (
    <div
      className="relative h-[calc(40vh-24px)] lg:h-[calc(100vh-60px)] w-full lg:w-[40%] flex items-center justify-center overflow-hidden p-5 lg:p-10"
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
        <div className="scale-150 md:scale-[1.8] lg:scale-[2] origin-center">
          <TreeAnimation progress={Math.max(progress, 0)} treeType={treeType} />
        </div>
      </div>
    </div>
  );
}
