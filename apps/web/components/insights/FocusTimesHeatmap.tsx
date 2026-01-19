'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Session } from '@/types/forest.types';
import { HeatmapCell } from './HeatmapCell';
import { processHeatmapData, hours, days } from '@/utils/heatmap-helpers';

interface FocusTimesHeatmapProps {
  sessions: Session[];
  isLoading?: boolean;
}

export function FocusTimesHeatmap({
  sessions,
  isLoading = false,
}: FocusTimesHeatmapProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { grid, maxValue, peakTime } = useMemo(() => {
    return processHeatmapData(sessions);
  }, [sessions]);

  // Filter hours for mobile (show 9 AM - 5 PM)
  const displayHours = isMobile
    ? hours.slice(3, 12) // 9 AM to 5 PM
    : hours;
  const displayGrid = isMobile ? grid.slice(3, 12) : grid;

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-80 rounded-2xl" />
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⏰</span>
          <h3 className="text-lg font-semibold text-text-primary">
            Best Focus Times
          </h3>
        </div>
        <div className="h-64 flex items-center justify-center text-text-secondary">
          <p>No session data for this period</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⏰</span>
        <h3 className="text-lg font-semibold text-text-primary">
          Best Focus Times
        </h3>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-[60px_1fr] grid-rows-[1fr_auto] gap-2 min-w-[500px]">
          {/* Hour labels (Y-axis) */}
          <div className="flex flex-col justify-around pr-2">
            {displayHours
              .filter((_, i) => i % 3 === 0 || i === displayHours.length - 1)
              .map((hour) => (
                <div
                  key={hour}
                  className="text-xs text-text-secondary text-right"
                >
                  {hour}
                </div>
              ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex flex-col gap-1">
            {displayGrid.map((row, hourIndex) => (
              <div key={hourIndex} className="flex gap-1">
                {row.map((value, dayIndex) => {
                  const cellIndex = hourIndex * 7 + dayIndex;
                  return (
                    <HeatmapCell
                      key={`${hourIndex}-${dayIndex}`}
                      value={value}
                      maxValue={maxValue}
                      hour={displayHours[hourIndex]}
                      day={days[dayIndex]}
                      index={cellIndex}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Day labels (X-axis) */}
          <div className="col-start-2 flex justify-around mt-1">
            {days.map((day) => (
              <div key={day} className="text-xs text-text-secondary">
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peak time display */}
      {peakTime && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-sm text-text-secondary flex items-center gap-2"
        >
          <span>🌟</span>
          <span>
            Peak: {peakTime.hour} on {peakTime.day} ({peakTime.value.toFixed(1)}
            h)
          </span>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-text-secondary">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-[#F1F5F9]" />
          <div className="w-4 h-4 rounded bg-[#FEF9C3]" />
          <div className="w-4 h-4 rounded bg-[#FDE047]" />
          <div className="w-4 h-4 rounded bg-[#FACC15]" />
          <div className="w-4 h-4 rounded bg-[#EAB308]" />
        </div>
        <span>More</span>
      </div>
    </Card>
  );
}
