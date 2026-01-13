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
      className="relative h-[calc(60vh-36px)] lg:h-[calc(100vh-60px)] w-full lg:w-[60%] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: backgroundGradient }}
    >
      <div className="w-full max-w-[600px] px-5 py-5 lg:px-10 lg:py-10">
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
