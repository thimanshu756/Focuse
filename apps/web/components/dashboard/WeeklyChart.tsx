'use client';

import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

// Lazy load Recharts to improve initial load time
const ChartComponent = lazy(() =>
  import('./WeeklyChartComponent').then((mod) => ({
    default: mod.WeeklyChartComponent,
  }))
);

interface WeeklyChartProps {
  data: Array<{ day: string; hours: number; sessions: number }>;
  isLoading?: boolean;
}

export function WeeklyChart({ data, isLoading }: WeeklyChartProps) {
  if (isLoading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <Skeleton variant="rectangular" width="100%" height={300} />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-[300px] flex items-center justify-center">
          <Skeleton variant="rectangular" width="100%" height={300} />
        </div>
      }
    >
      <ChartComponent data={data} />
    </Suspense>
  );
}
