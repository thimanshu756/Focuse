'use client';

import { ReactNode } from 'react';

interface InfoPanelProps {
  children?: ReactNode;
  backgroundGradient: string;
}

/**
 * Right panel container for timer and session info
 * Desktop: 60% width, full height
 * Mobile: 100% width, 60% height
 */
export function InfoPanel({ children, backgroundGradient }: InfoPanelProps) {
  return (
    <div
      className="relative h-full w-full lg:w-[60%] flex flex-col overflow-hidden"
      style={{ background: backgroundGradient }}
    >
      <div className="w-full max-w-[600px] mx-auto px-5 py-5 lg:px-10 lg:py-10 flex flex-col h-full">
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
