'use client';

import { motion } from 'framer-motion';

interface TreeAnimationProps {
  progress: number; // 0-100
  treeType: 'basic' | 'premium' | 'elite'; // Tree tier based on duration
}

export const TreeAnimation = ({
  progress,
  treeType = 'basic',
}: TreeAnimationProps) => {
  // Helper function to determine if element should be visible
  const shouldShow = (minProgress: number) => progress >= minProgress;

  // Helper function to get animation progress for each element
  const getElementProgress = (startProgress: number, endProgress: number) => {
    if (progress < startProgress) return 0;
    if (progress > endProgress) return 1;
    return (progress - startProgress) / (endProgress - startProgress);
  };

  return (
    <div className="w-full max-w-[320px] mx-auto h-[280px] flex items-end justify-center">
      <motion.svg
        viewBox="0 0 200 300"
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Ground/Soil base - larger and more visible */}
        <motion.ellipse
          cx="100"
          cy="275"
          rx="45"
          ry="12"
          fill="#8B7355"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: shouldShow(0) ? 1 : 0,
            opacity: shouldShow(0) ? 1 : 0,
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Darker soil layer */}
        <motion.ellipse
          cx="100"
          cy="273"
          rx="38"
          ry="8"
          fill="#6B5344"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: shouldShow(0) ? 1 : 0,
            opacity: shouldShow(0) ? 0.8 : 0,
          }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        />

        {/* Grass blades - left side */}
        <motion.path
          d="M 65 275 Q 63 268 61 265"
          stroke="#7CB342"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: shouldShow(3) ? 1 : 0,
            opacity: shouldShow(3) ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.15 }}
        />

        <motion.path
          d="M 70 276 Q 69 270 68 266"
          stroke="#8BC34A"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: shouldShow(3) ? 1 : 0,
            opacity: shouldShow(3) ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.2 }}
        />

        <motion.path
          d="M 75 277 Q 73 271 71 267"
          stroke="#9CCC65"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: shouldShow(3) ? 1 : 0,
            opacity: shouldShow(3) ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.25 }}
        />

        {/* Grass blades - right side */}
        <motion.path
          d="M 125 277 Q 127 271 129 267"
          stroke="#9CCC65"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: shouldShow(3) ? 1 : 0,
            opacity: shouldShow(3) ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 }}
        />

        <motion.path
          d="M 130 276 Q 131 270 132 266"
          stroke="#8BC34A"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: shouldShow(3) ? 1 : 0,
            opacity: shouldShow(3) ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.35 }}
        />

        <motion.path
          d="M 135 275 Q 137 268 139 265"
          stroke="#7CB342"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: shouldShow(3) ? 1 : 0,
            opacity: shouldShow(3) ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: 0.4 }}
        />

        {/* Seed */}
        <motion.ellipse
          cx="100"
          cy="274"
          rx="6"
          ry="8"
          fill="#6B5344"
          initial={{ scale: 0 }}
          animate={{ scale: shouldShow(5) ? 1 : 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 15,
            delay: 0.2,
          }}
        />

        {/* Main trunk - draws from bottom to top */}
        <motion.line
          x1="100"
          y1="270"
          x2="100"
          y2="120"
          stroke="#A0826D"
          strokeWidth="14"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: getElementProgress(15, 50) }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* Tree Foliage - Different designs based on tree type */}

        {/* BASIC TREE (0-15 mins) - Simple green triangles */}
        {treeType === 'basic' && (
          <>
            {/* BOTTOM TIER */}
            <motion.polygon
              points="45,180 100,95 100,180"
              fill="#2E7D32"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(70) ? 1 : 0,
                opacity: shouldShow(70) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.6,
              }}
            />
            <motion.polygon
              points="100,95 155,180 100,180"
              fill="#66BB6A"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(70) ? 1 : 0,
                opacity: shouldShow(70) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.65,
              }}
            />

            {/* SECOND TIER */}
            <motion.polygon
              points="58,130 100,55 100,130"
              fill="#388E3C"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(74) ? 1 : 0,
                opacity: shouldShow(74) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.75,
              }}
            />
            <motion.polygon
              points="100,55 142,130 100,130"
              fill="#81C784"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(74) ? 1 : 0,
                opacity: shouldShow(74) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.8,
              }}
            />

            {/* THIRD TIER */}
            <motion.polygon
              points="70,85 100,25 100,85"
              fill="#43A047"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(78) ? 1 : 0,
                opacity: shouldShow(78) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.9,
              }}
            />
            <motion.polygon
              points="100,25 130,85 100,85"
              fill="#9CCC65"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(78) ? 1 : 0,
                opacity: shouldShow(78) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.95,
              }}
            />

            {/* TOP PEAK */}
            <motion.polygon
              points="82,50 100,10 118,50"
              fill="#AED581"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(82) ? 1 : 0,
                opacity: shouldShow(82) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 1.05,
              }}
            />
          </>
        )}

        {/* PREMIUM TREE (15-45 mins) - Vibrant with pink blossoms */}
        {treeType === 'premium' && (
          <>
            {/* BOTTOM TIER - Richer greens */}
            <motion.polygon
              points="45,180 100,95 100,180"
              fill="#1B5E20"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(70) ? 1 : 0,
                opacity: shouldShow(70) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.6,
              }}
            />
            <motion.polygon
              points="100,95 155,180 100,180"
              fill="#4CAF50"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(70) ? 1 : 0,
                opacity: shouldShow(70) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.65,
              }}
            />

            {/* SECOND TIER - Vibrant */}
            <motion.polygon
              points="58,130 100,55 100,130"
              fill="#2E7D32"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(74) ? 1 : 0,
                opacity: shouldShow(74) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.75,
              }}
            />
            <motion.polygon
              points="100,55 142,130 100,130"
              fill="#66BB6A"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(74) ? 1 : 0,
                opacity: shouldShow(74) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.8,
              }}
            />

            {/* THIRD TIER - Bright */}
            <motion.polygon
              points="70,85 100,25 100,85"
              fill="#388E3C"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(78) ? 1 : 0,
                opacity: shouldShow(78) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.9,
              }}
            />
            <motion.polygon
              points="100,25 130,85 100,85"
              fill="#81C784"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(78) ? 1 : 0,
                opacity: shouldShow(78) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.95,
              }}
            />

            {/* TOP PEAK - Light green */}
            <motion.polygon
              points="82,50 100,10 118,50"
              fill="#9CCC65"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(82) ? 1 : 0,
                opacity: shouldShow(82) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 1.05,
              }}
            />

            {/* PINK BLOSSOMS - Premium feature */}
            <motion.circle
              cx="65"
              cy="160"
              r="6"
              fill="#FF4081"
              initial={{ scale: 0 }}
              animate={{ scale: shouldShow(85) ? 1 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
                delay: 1.1,
              }}
            />
            <motion.circle
              cx="135"
              cy="160"
              r="6"
              fill="#FF80AB"
              initial={{ scale: 0 }}
              animate={{ scale: shouldShow(85) ? 1 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
                delay: 1.15,
              }}
            />
            <motion.circle
              cx="75"
              cy="110"
              r="5"
              fill="#FF4081"
              initial={{ scale: 0 }}
              animate={{ scale: shouldShow(87) ? 1 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
                delay: 1.2,
              }}
            />
            <motion.circle
              cx="125"
              cy="110"
              r="5"
              fill="#FF80AB"
              initial={{ scale: 0 }}
              animate={{ scale: shouldShow(87) ? 1 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
                delay: 1.25,
              }}
            />
            <motion.circle
              cx="85"
              cy="70"
              r="4"
              fill="#F48FB1"
              initial={{ scale: 0 }}
              animate={{ scale: shouldShow(89) ? 1 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
                delay: 1.3,
              }}
            />
            <motion.circle
              cx="115"
              cy="70"
              r="4"
              fill="#FF80AB"
              initial={{ scale: 0 }}
              animate={{ scale: shouldShow(89) ? 1 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
                delay: 1.35,
              }}
            />
          </>
        )}

        {/* ELITE TREE (45+ mins) - Golden/Cherry Blossom Premium */}
        {treeType === 'elite' && (
          <>
            {/* BOTTOM TIER - Deep rich green */}
            <motion.polygon
              points="45,180 100,95 100,180"
              fill="#0D47A1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(70) ? 1 : 0,
                opacity: shouldShow(70) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.6,
              }}
            />
            <motion.polygon
              points="100,95 155,180 100,180"
              fill="#1976D2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(70) ? 1 : 0,
                opacity: shouldShow(70) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.65,
              }}
            />

            {/* SECOND TIER - Blue-green gradient effect */}
            <motion.polygon
              points="58,130 100,55 100,130"
              fill="#1565C0"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(74) ? 1 : 0,
                opacity: shouldShow(74) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.75,
              }}
            />
            <motion.polygon
              points="100,55 142,130 100,130"
              fill="#42A5F5"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(74) ? 1 : 0,
                opacity: shouldShow(74) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.8,
              }}
            />

            {/* THIRD TIER - Cyan tones */}
            <motion.polygon
              points="70,85 100,25 100,85"
              fill="#0288D1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(78) ? 1 : 0,
                opacity: shouldShow(78) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.9,
              }}
            />
            <motion.polygon
              points="100,25 130,85 100,85"
              fill="#29B6F6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(78) ? 1 : 0,
                opacity: shouldShow(78) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 0.95,
              }}
            />

            {/* TOP PEAK - Light cyan/white */}
            <motion.polygon
              points="82,50 100,10 118,50"
              fill="#81D4FA"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(82) ? 1 : 0,
                opacity: shouldShow(82) ? 1 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 12,
                delay: 1.05,
              }}
            />

            {/* GOLDEN BLOSSOMS - Elite feature */}
            <motion.circle
              cx="60"
              cy="165"
              r="7"
              fill="#FFD700"
              initial={{ scale: 0 }}
              animate={{ scale: shouldShow(85) ? 1 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
                delay: 1.1,
              }}
            />
            <motion.circle
              cx="140"
              cy="165"
              r="7"
              fill="#FFC107"
              initial={{ scale: 0 }}
              animate={{ scale: shouldShow(85) ? 1 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
                delay: 1.15,
              }}
            />
            <motion.circle
              cx="70"
              cy="115"
              r="6"
              fill="#FFD700"
              initial={{ scale: 0 }}
              animate={{ scale: shouldShow(87) ? 1 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
                delay: 1.2,
              }}
            />
            <motion.circle
              cx="130"
              cy="115"
              r="6"
              fill="#FFC107"
              initial={{ scale: 0 }}
              animate={{ scale: shouldShow(87) ? 1 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
                delay: 1.25,
              }}
            />
            <motion.circle
              cx="80"
              cy="75"
              r="5"
              fill="#FFEB3B"
              initial={{ scale: 0 }}
              animate={{ scale: shouldShow(89) ? 1 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
                delay: 1.3,
              }}
            />
            <motion.circle
              cx="120"
              cy="75"
              r="5"
              fill="#FFC107"
              initial={{ scale: 0 }}
              animate={{ scale: shouldShow(89) ? 1 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
                delay: 1.35,
              }}
            />
            <motion.circle
              cx="95"
              cy="40"
              r="4"
              fill="#FFD700"
              initial={{ scale: 0 }}
              animate={{ scale: shouldShow(91) ? 1 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
                delay: 1.4,
              }}
            />
            <motion.circle
              cx="105"
              cy="40"
              r="4"
              fill="#FFEB3B"
              initial={{ scale: 0 }}
              animate={{ scale: shouldShow(91) ? 1 : 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 10,
                delay: 1.45,
              }}
            />

            {/* GOLDEN SPARKLES around tree */}
            <motion.circle
              cx="50"
              cy="140"
              r="3"
              fill="#FFF59D"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(92) ? [0, 1, 0] : 0,
                opacity: shouldShow(92) ? [0, 1, 0] : 0,
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.circle
              cx="150"
              cy="140"
              r="3"
              fill="#FFF59D"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: shouldShow(92) ? [0, 1, 0] : 0,
                opacity: shouldShow(92) ? [0, 1, 0] : 0,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                delay: 0.5,
              }}
            />
          </>
        )}

        {/* Completion sparkle effect */}
        {progress === 100 && (
          <>
            {/* Center sparkle */}
            <motion.circle
              cx="100"
              cy="95"
              r="6"
              fill="#D7F50A"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.8, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.2,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
            />

            {/* Sparkle particles */}
            <motion.circle
              cx="90"
              cy="85"
              r="3"
              fill="#D7F50A"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [0, -10, -20],
              }}
              transition={{
                duration: 1.5,
                ease: 'easeOut',
                repeat: Infinity,
                repeatDelay: 0.8,
              }}
            />

            <motion.circle
              cx="110"
              cy="85"
              r="3"
              fill="#E9FF6A"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [0, -10, -20],
              }}
              transition={{
                duration: 1.5,
                ease: 'easeOut',
                delay: 0.3,
                repeat: Infinity,
                repeatDelay: 0.8,
              }}
            />

            <motion.circle
              cx="100"
              cy="80"
              r="3"
              fill="#D7F50A"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [0, -10, -20],
              }}
              transition={{
                duration: 1.5,
                ease: 'easeOut',
                delay: 0.6,
                repeat: Infinity,
                repeatDelay: 0.8,
              }}
            />
          </>
        )}
      </motion.svg>
    </div>
  );
};
