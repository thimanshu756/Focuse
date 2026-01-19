'use client';

import { motion } from 'framer-motion';

export const DeadTreeAnimation = () => {
  return (
    <div className="w-full h-full flex items-end justify-center opacity-60">
      <motion.svg
        viewBox="0 0 200 300"
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.5 }}
      >
        {/* Ground */}
        <ellipse
          cx="100"
          cy="275"
          rx="45"
          ry="12"
          fill="#4B5563"
          opacity="0.5"
        />

        {/* Dead trunk - grey/brown */}
        <line
          x1="100"
          y1="270"
          x2="100"
          y2="140"
          stroke="#57534E"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Broken branches */}
        <motion.line
          x1="100"
          y1="180"
          x2="70"
          y2="165"
          stroke="#57534E"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />

        <motion.line
          x1="100"
          y1="200"
          x2="130"
          y2="190"
          stroke="#57534E"
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />

        {/* Broken top */}
        <motion.line
          x1="100"
          y1="140"
          x2="95"
          y2="125"
          stroke="#57534E"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        />

        {/* Dead leaves on ground */}
        <motion.circle
          cx="70"
          cy="273"
          r="3"
          fill="#78716C"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6 }}
        />
        <motion.circle
          cx="80"
          cy="275"
          r="2.5"
          fill="#78716C"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.65 }}
        />
        <motion.circle
          cx="120"
          cy="274"
          r="3"
          fill="#78716C"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7 }}
        />
        <motion.circle
          cx="130"
          cy="276"
          r="2"
          fill="#78716C"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.75 }}
        />

        {/* Small gravestone/marker */}
        <motion.rect
          x="85"
          y="255"
          width="30"
          height="15"
          rx="2"
          fill="#6B7280"
          opacity="0.7"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
        />
        <motion.circle
          cx="100"
          cy="255"
          r="5"
          fill="#6B7280"
          opacity="0.7"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.85, type: 'spring' }}
        />
      </motion.svg>
    </div>
  );
};
