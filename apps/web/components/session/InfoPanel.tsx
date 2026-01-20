'use client';

import { ReactNode } from 'react';

interface InfoPanelProps {
  children?: ReactNode;
  backgroundGradient: string;
  orientation?: 'portrait' | 'landscape'; // Mobile orientation
  isMobile?: boolean; // Is mobile device
}

/**
 * Right panel container for timer and session info
 * Desktop: 60% width, full height
 * Mobile Portrait: 100% width, 55% height
 * Mobile Landscape: 50% width, full height
 */
export function InfoPanel({
  children,
  backgroundGradient,
  orientation = 'portrait',
  isMobile = false,
}: InfoPanelProps) {
  // Dynamic sizing based on orientation and screen size
  const getContainerClasses = () => {
    if (!isMobile) {
      return 'relative h-full w-full lg:w-[60%] flex flex-col overflow-hidden';
    }

    if (orientation === 'landscape') {
      // Landscape: side-by-side (50% width, full height)
      return 'relative h-[calc(100vh-60px)] w-1/2 flex flex-col overflow-y-auto';
    } else {
      // Portrait: stacked (full width, 55% height)
      return 'relative h-[55vh] w-full flex flex-col overflow-y-auto';
    }
  };

  const getPaddingClasses = () => {
    if (!isMobile) {
      return 'w-full max-w-[600px] mx-auto px-5 py-5 lg:px-10 lg:py-10 flex flex-col h-full';
    }

    if (orientation === 'landscape') {
      // Landscape: compact padding
      return 'w-full mx-auto px-3 py-3 flex flex-col h-full';
    } else {
      // Portrait: comfortable padding
      return 'w-full max-w-[600px] mx-auto px-5 py-4 flex flex-col h-full';
    }
  };

  return (
    <div
      className={getContainerClasses()}
      style={{ background: backgroundGradient }}
    >
      <div className={getPaddingClasses()}>
        {/* Placeholder content - will be replaced by Feature 3 */}
        {children || (
          <div className="text-center">
            <p className="text-white/80 text-lg font-medium">Timer panel</p>
          </div>
        )}
      </div>
    </div>
  );
}
