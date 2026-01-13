'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TreeAnimation } from '@/components/TreeAnimation';

interface TreeVisualizationPanelProps {
  progress: number;
  treeType: 'basic' | 'premium' | 'elite';
  isGivingUp?: boolean;
}

// Time-based gradient backgrounds with smooth transitions
const getBackgroundGradient = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 8) {
    // Dawn: Soft purple-pink sunrise
    return 'linear-gradient(180deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
  } else if (hour >= 8 && hour < 12) {
    // Morning: Bright blue sky with clouds
    return 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #B0E0E6 100%)';
  } else if (hour >= 12 && hour < 16) {
    // Afternoon: Vibrant blue
    return 'linear-gradient(180deg, #4A90E2 0%, #87CEEB 50%, #B0E0E6 100%)';
  } else if (hour >= 16 && hour < 19) {
    // Evening: Warm sunset
    return 'linear-gradient(180deg, #FF6B6B 0%, #FFA07A 50%, #FFD700 100%)';
  } else if (hour >= 19 && hour < 22) {
    // Dusk: Purple-orange transition
    return 'linear-gradient(180deg, #2C3E50 0%, #8B4789 50%, #FF6B6B 100%)';
  } else {
    // Night: Deep starry sky
    return 'linear-gradient(180deg, #0F1419 0%, #1A1A2E 50%, #16213E 100%)';
  }
};

// Particle types based on time of day
const getParticleType = () => {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 18) {
    return 'leaves'; // Morning/Afternoon
  } else if (hour >= 18 && hour < 22) {
    return 'fireflies'; // Evening
  } else {
    return 'stars'; // Night
  }
};

// Generate random particles
const generateParticles = (type: string, count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100, // Random X position (%)
    y: Math.random() * 100, // Random Y position (%)
    delay: Math.random() * 5, // Random animation delay
    duration: 15 + Math.random() * 10, // Random duration (15-25s)
    size: type === 'stars' ? 2 + Math.random() * 3 : 8 + Math.random() * 8,
  }));
};

// Leaf particle component
function LeafParticle({ particle }: { particle: any }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
      }}
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
        y: [0, 100, 200],
        x: [0, Math.sin(particle.id) * 50, Math.sin(particle.id * 2) * 100],
        rotate: [0, 360],
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <div
        className="rounded-full bg-green-400/40 blur-sm"
        style={{
          width: particle.size,
          height: particle.size,
        }}
      />
    </motion.div>
  );
}

// Firefly particle component
function FireflyParticle({ particle }: { particle: any }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
      }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 0.5, 1, 0],
        y: [0, -50, -100, -150, -200],
        x: [
          0,
          Math.sin(particle.id) * 30,
          Math.cos(particle.id) * 40,
          Math.sin(particle.id * 2) * 50,
        ],
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div
        className="rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)]"
        style={{
          width: particle.size,
          height: particle.size,
        }}
      />
    </motion.div>
  );
}

// Star particle component
function StarParticle({ particle }: { particle: any }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
      }}
      animate={{
        opacity: [0.2, 1, 0.2],
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div
        className="rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
        style={{
          width: particle.size,
          height: particle.size,
        }}
      />
    </motion.div>
  );
}

export function TreeVisualizationPanel({
  progress,
  treeType,
  isGivingUp = false,
}: TreeVisualizationPanelProps) {
  const [gradient, setGradient] = useState(getBackgroundGradient());
  const [particleType, setParticleType] = useState(getParticleType());
  const [particles, setParticles] = useState(() =>
    generateParticles(particleType, particleType === 'stars' ? 12 : 8)
  );

  // Update gradient and particles every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setGradient(getBackgroundGradient());
      const newParticleType = getParticleType();
      if (newParticleType !== particleType) {
        setParticleType(newParticleType);
        setParticles(
          generateParticles(
            newParticleType,
            newParticleType === 'stars' ? 12 : 8
          )
        );
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [particleType]);

  return (
    <div
      className="relative h-full flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: gradient,
        transition: 'background 2s ease-in-out',
      }}
    >
      {/* Animated Clouds (Morning/Afternoon) - Enhanced with multiple layers */}
      {particleType === 'leaves' && (
        <>
          <motion.div
            className="absolute top-[8%] left-[-10%] w-40 h-20 bg-white/25 rounded-full blur-2xl"
            animate={{
              x: ['0%', '120vw'],
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className="absolute top-[20%] left-[-15%] w-56 h-24 bg-white/20 rounded-full blur-2xl"
            animate={{
              x: ['0%', '120vw'],
            }}
            transition={{
              duration: 80,
              repeat: Infinity,
              ease: 'linear',
              delay: 10,
            }}
          />
          <motion.div
            className="absolute top-[35%] left-[-20%] w-48 h-18 bg-white/15 rounded-full blur-xl"
            animate={{
              x: ['0%', '120vw'],
            }}
            transition={{
              duration: 100,
              repeat: Infinity,
              ease: 'linear',
              delay: 20,
            }}
          />
        </>
      )}

      {/* Particle System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => {
          if (particleType === 'leaves') {
            return <LeafParticle key={particle.id} particle={particle} />;
          } else if (particleType === 'fireflies') {
            return <FireflyParticle key={particle.id} particle={particle} />;
          } else {
            return <StarParticle key={particle.id} particle={particle} />;
          }
        })}
      </div>

      {/* Tree Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Tree Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="h-[280px] lg:h-[350px]">
            <TreeAnimation
              progress={progress}
              treeType={treeType}
              key={isGivingUp ? 'withering' : 'growing'}
            />
          </div>

          {/* Tree Shadow */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/20 rounded-full blur-md"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.25, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Enhanced Ground Layer with depth */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-900/50 via-green-800/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-green-800/40 backdrop-blur-sm border-t border-green-700/30">
          <div className="absolute inset-0 flex items-end justify-center gap-1 pb-1">
            {/* Enhanced grass effect with more variety */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-green-500/50 rounded-t-full"
                style={{
                  height: `${6 + Math.random() * 10}px`,
                  marginLeft: `${Math.random() * 2}px`,
                  marginRight: `${Math.random() * 2}px`,
                }}
                animate={{
                  scaleY: [1, 1.15, 1],
                  opacity: [0.5, 0.7, 0.5],
                  x: [0, Math.sin(i) * 2, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  delay: Math.random() * 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Time indicator (subtle) */}
      <div className="absolute top-6 left-6 text-white/40 text-xs font-medium tracking-wide">
        {new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })}
      </div>
    </div>
  );
}
