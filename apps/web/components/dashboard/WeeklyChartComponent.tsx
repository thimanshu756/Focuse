'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WeeklyChartComponentProps {
  data: Array<{ day: string; hours: number; sessions: number }>;
}

export function WeeklyChartComponent({ data }: WeeklyChartComponentProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-text-primary mb-1">
            {data.day}
          </p>
          <p className="text-sm text-text-secondary">
            {data.hours.toFixed(1)}h focused
          </p>
          <p className="text-xs text-text-muted">
            {data.sessions} {data.sessions === 1 ? 'session' : 'sessions'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        role="img"
        aria-label="Weekly focus time chart"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} />
        <YAxis
          stroke="#64748B"
          fontSize={12}
          tickLine={false}
          tickFormatter={(value) => `${value}h`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="hours" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#16A34A" stopOpacity={0.6} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
