'use client';

import { motion } from 'framer-motion';

interface HeatmapCellProps {
  value: number; // Hours of focus
  maxValue: number;
  hour: string;
  day: string;
  index: number;
}

export function HeatmapCell({
  value,
  maxValue,
  hour,
  day,
  index,
}: HeatmapCellProps) {
  const intensity = maxValue > 0 ? value / maxValue : 0;
  const backgroundColor = getHeatmapColor(value, intensity);

  return (
    <motion.div
      className="w-8 h-6 md:w-10 md:h-6 rounded-md cursor-pointer transition-all"
      style={{ backgroundColor }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.01 }}
      whileHover={{ scale: 1.15, zIndex: 10 }}
      title={`${day}, ${hour}: ${value > 0 ? value.toFixed(1) + 'h' : 'No sessions'}`}
      role="button"
      tabIndex={0}
      aria-label={`${day} ${hour}: ${value > 0 ? value.toFixed(1) + ' hours' : 'No focus time'}`}
    />
  );
}

function getHeatmapColor(hours: number, intensity: number): string {
  if (hours === 0) return '#F1F5F9'; // Light gray (no data)

  // Yellow gradient based on intensity
  if (intensity < 0.25) return '#FEF9C3'; // Very light yellow
  if (intensity < 0.5) return '#FDE047'; // Light yellow
  if (intensity < 0.75) return '#FACC15'; // Medium yellow
  return '#EAB308'; // Dark yellow/gold (highest)
}
