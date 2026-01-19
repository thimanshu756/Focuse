'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { DailyBreakdown } from '@/types/insights.types';
import { Period } from '@/types/insights.types';

interface FocusTimeTrendChartProps {
  dailyBreakdown: DailyBreakdown[];
  period: Period;
  isLoading?: boolean;
}

export function FocusTimeTrendChart({
  dailyBreakdown,
  period,
  isLoading = false,
}: FocusTimeTrendChartProps) {
  const chartData = useMemo(() => {
    return dailyBreakdown.map((day) => ({
      date: format(new Date(day.date), 'MMM d'), // "Jan 10"
      hours: parseFloat((day.focusTime / 3600).toFixed(1)), // Convert seconds to hours, 1 decimal
      sessions: day.sessions,
    }));
  }, [dailyBreakdown]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">📊</span>
          <h3 className="text-lg font-semibold text-text-primary">
            Focus Time by Day
          </h3>
        </div>
        <div className="h-64 flex items-center justify-center text-text-secondary">
          <p>No focus time data for this period</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <span className="text-xl">📊</span>
        <h3 className="text-lg font-semibold text-text-primary">
          Focus Time by Day
        </h3>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              stroke="#64748B"
              style={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              stroke="#64748B"
              style={{ fontSize: 12 }}
              tickLine={false}
              label={{
                value: 'Hours',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12, fill: '#64748B' },
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '12px',
                backgroundColor: 'white',
              }}
              formatter={(value: any, name?: string) => {
                if (name === 'hours') return [`${value}h`, 'Focus Time'];
                return [value, name || ''];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#D7F50A"
              strokeWidth={3}
              dot={{ fill: '#D7F50A', r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
