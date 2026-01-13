import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

// Simple confetti implementation (lightweight alternative to canvas-confetti)
const triggerConfetti = () => {
  // Create confetti container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9999';
  document.body.appendChild(container);

  // Create confetti pieces
  const colors = ['#D7F50A', '#22C55E', '#FBBF24', '#3B82F6', '#EC4899'];
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = '10px';
    particle.style.height = '10px';
    particle.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = '50%';
    particle.style.opacity = '1';
    particle.style.transform = 'scale(1)';
    particle.style.transition = 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    container.appendChild(particle);

    // Animate
    requestAnimationFrame(() => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 100 + Math.random() * 200;
      const x = Math.cos(angle) * velocity;
      const y = Math.sin(angle) * velocity - 300;

      particle.style.transform = `translate(${x}px, ${y}px) rotate(${Math.random() * 720}deg) scale(0)`;
      particle.style.opacity = '0';
    });
  }

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(container);
  }, 2000);
};

interface MilestoneMessages {
  [key: number]: string;
}

const milestoneMessages: MilestoneMessages = {
  10: '🎉 10 minutes! Great start!',
  20: "💪 20 minutes! You're crushing it!",
  30: '🔥 30 minutes! Unstoppable!',
  40: '⭐ 40 minutes! Almost there!',
  50: '🏆 Elite focus achieved!',
  60: '👑 60 minutes! Legendary!',
};

export function useMilestoneCelebrations(
  progress: number,
  duration: number,
  isActive: boolean = true
) {
  const celebratedMilestonesRef = useRef<Set<number>>(new Set());
  const lastProgressRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive || progress === 0) return;

    // Calculate elapsed minutes
    const elapsedMinutes = Math.floor((progress * duration) / 60);

    // Only check if we've moved forward in time
    if (elapsedMinutes <= lastProgressRef.current) return;

    lastProgressRef.current = elapsedMinutes;

    // Check for 10-minute milestones
    if (elapsedMinutes > 0 && elapsedMinutes % 10 === 0) {
      if (!celebratedMilestonesRef.current.has(elapsedMinutes)) {
        // Mark as celebrated
        celebratedMilestonesRef.current.add(elapsedMinutes);

        // Trigger celebration
        const message =
          milestoneMessages[elapsedMinutes] ||
          `🎯 ${elapsedMinutes} minutes focused!`;

        // Show confetti
        triggerConfetti();

        // Show toast
        toast.success(message, {
          duration: 4000,
          icon: '🎉',
          style: {
            background: '#22C55E',
            color: '#fff',
            fontWeight: '600',
          },
        });

        // Play success sound (optional)
        try {
          const audio = new Audio('/sounds/milestone.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Ignore if audio fails to play
          });
        } catch (error) {
          // Ignore audio errors
        }
      }
    }
  }, [progress, duration, isActive]);

  // Reset celebrated milestones when session changes
  useEffect(() => {
    return () => {
      celebratedMilestonesRef.current.clear();
      lastProgressRef.current = 0;
    };
  }, []);
}
