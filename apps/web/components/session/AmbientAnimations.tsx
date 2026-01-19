'use client';

import { useEffect, useState } from 'react';
import {
  TimeOfDay,
  getParticleType,
  shouldShowClouds,
} from '@/utils/time-gradients';

interface AmbientAnimationsProps {
  timeOfDay: TimeOfDay;
  reducedMotion?: boolean;
  isMobile?: boolean;
}

interface Cloud {
  id: number;
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
}

interface Particle {
  id: number;
  left: number;
  top?: number; // For fireflies and stars
  delay: number;
  duration: number;
  size?: number; // For fireflies and stars
}

/**
 * Ambient animations component that renders clouds, particles, and stars
 * based on time of day
 */
export function AmbientAnimations({
  timeOfDay,
  reducedMotion = false,
  isMobile = false,
}: AmbientAnimationsProps) {
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const showClouds = shouldShowClouds(timeOfDay);
  const particleType = getParticleType(timeOfDay);

  // Initialize clouds for daytime
  useEffect(() => {
    if (!showClouds || reducedMotion) {
      setClouds([]);
      return;
    }

    // Create clouds with random properties (fewer on mobile)
    const cloudCount = isMobile ? 2 : Math.floor(Math.random() * 3) + 3; // 2 on mobile, 3-5 on desktop
    const newClouds: Cloud[] = Array.from({ length: cloudCount }, (_, i) => ({
      id: i,
      size: [60, 100, 140][Math.floor(Math.random() * 3)], // Small, medium, or large
      left: Math.random() * 100, // Random horizontal start position
      top: Math.random() * 60 + 10, // Random vertical position (10-70%)
      duration: 50 + Math.random() * 20, // 50-70 seconds for variety
      delay: Math.random() * 20, // Stagger start times
    }));

    setClouds(newClouds);
  }, [showClouds, reducedMotion]);

  // Initialize particles based on time of day
  useEffect(() => {
    if (reducedMotion || particleType === 'none') {
      setParticles([]);
      return;
    }

    let particleCount: number;
    if (particleType === 'leaves') {
      particleCount = isMobile
        ? Math.floor(Math.random() * 2) + 3 // 3-4 leaves on mobile (50% of desktop)
        : Math.floor(Math.random() * 4) + 5; // 5-8 leaves on desktop
    } else if (particleType === 'fireflies') {
      particleCount = isMobile
        ? Math.floor(Math.random() * 2) + 4 // 4-5 fireflies on mobile (50% of desktop)
        : Math.floor(Math.random() * 3) + 8; // 8-10 fireflies on desktop
    } else {
      // stars
      particleCount = isMobile
        ? Math.floor(Math.random() * 2) + 6 // 6-7 stars on mobile (50% of desktop)
        : Math.floor(Math.random() * 4) + 12; // 12-15 stars on desktop
    }

    const newParticles: Particle[] = Array.from(
      { length: particleCount },
      (_, i) => {
        const baseParticle = {
          id: i,
          left: Math.random() * 100, // Random X position
          delay: Math.random() * 5, // Random delay
          duration:
            particleType === 'stars'
              ? 2 + Math.random() * 2 // 2-4 seconds for stars
              : particleType === 'fireflies'
                ? 10 + Math.random() * 5 // 10-15 seconds for fireflies
                : 8 + Math.random() * 4, // 8-12 seconds for leaves
        };

        if (particleType === 'fireflies') {
          return {
            ...baseParticle,
            top: 20 + Math.random() * 60, // Random vertical position
            size: 8 + Math.random() * 4, // 8-12px
          };
        } else if (particleType === 'stars') {
          return {
            ...baseParticle,
            top: Math.random() * 50, // Top half only
            size: 4 + Math.random() * 4, // 4-8px
          };
        }

        return baseParticle;
      }
    );

    setParticles(newParticles);
  }, [particleType, reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return (
    <>
      {/* Cloud Layer */}
      {showClouds && clouds.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {clouds.map((cloud) => (
            <div
              key={cloud.id}
              className="absolute rounded-full bg-white opacity-[0.2] animate-drift"
              style={{
                width: `${cloud.size}px`,
                height: `${cloud.size * 0.6}px`,
                left: `${cloud.left}%`,
                top: `${cloud.top}%`,
                animationDuration: `${cloud.duration}s`,
                animationDelay: `${cloud.delay}s`,
                willChange: 'transform',
              }}
            />
          ))}
        </div>
      )}

      {/* Particle Layer */}
      {particles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => {
            if (particleType === 'leaves') {
              return (
                <div
                  key={particle.id}
                  className="absolute text-2xl animate-float-up"
                  style={{
                    left: `${particle.left}%`,
                    bottom: '-30px',
                    animationDuration: `${particle.duration}s`,
                    animationDelay: `${particle.delay}s`,
                    willChange: 'transform, opacity',
                  }}
                >
                  🍃
                </div>
              );
            } else if (particleType === 'fireflies') {
              return (
                <div
                  key={particle.id}
                  className="absolute rounded-full bg-yellow-300 animate-firefly-float"
                  style={{
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    boxShadow: `0 0 ${(particle.size || 10) * 2}px rgba(255, 255, 0, 0.8)`,
                    animationDuration: `${particle.duration}s`,
                    animationDelay: `${particle.delay}s`,
                    willChange: 'transform, opacity',
                  }}
                />
              );
            } else {
              // stars
              return (
                <div
                  key={particle.id}
                  className="absolute rounded-full bg-white animate-twinkle"
                  style={{
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    animationDuration: `${particle.duration}s`,
                    animationDelay: `${particle.delay}s`,
                    willChange: 'opacity',
                  }}
                />
              );
            }
          })}
        </div>
      )}
    </>
  );
}
