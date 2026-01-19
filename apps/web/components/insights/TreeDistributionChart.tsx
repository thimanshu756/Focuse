'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Session } from '@/types/forest.types';

interface TreeDistributionChartProps {
  sessions: Session[];
  isLoading?: boolean;
}

interface TreeData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  icon: string;
  label: string;
  [key: string]: string | number; // Index signature for recharts compatibility
}

function calculateTreeDistribution(sessions: Session[]): TreeData[] {
  const counts = { basic: 0, premium: 0, elite: 0 };

  sessions.forEach((session) => {
    const minutes = session.duration / 60;
    if (minutes <= 15) counts.basic++;
    else if (minutes <= 45) counts.premium++;
    else counts.elite++;
  });

  const total = sessions.length;

  return [
    {
      name: 'Basic',
      value: counts.basic,
      percentage: total > 0 ? Math.round((counts.basic / total) * 100) : 0,
      color: '#86EFAC', // Light green
      icon: '🌱',
      label: '≤15 min',
    },
    {
      name: 'Premium',
      value: counts.premium,
      percentage: total > 0 ? Math.round((counts.premium / total) * 100) : 0,
      color: '#22C55E', // Medium green
      icon: '🌳',
      label: '16-45 min',
    },
    {
      name: 'Elite',
      value: counts.elite,
      percentage: total > 0 ? Math.round((counts.elite / total) * 100) : 0,
      color: '#15803D', // Dark green
      icon: '🏆',
      label: '>45 min',
    },
  ];
}

export function TreeDistributionChart({
  sessions,
  isLoading = false,
}: TreeDistributionChartProps) {
  const treeData = useMemo(() => {
    return calculateTreeDistribution(sessions);
  }, [sessions]);

  const totalSessions = sessions.length;

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-80 rounded-2xl" />
      </Card>
    );
  }

  if (totalSessions === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🌳</span>
          <h3 className="text-lg font-semibold text-text-primary">
            Tree Distribution
          </h3>
        </div>
        <div className="h-64 flex items-center justify-center text-text-secondary">
          <p>Complete sessions to see distribution</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🌳</span>
        <h3 className="text-lg font-semibold text-text-primary">
          Tree Distribution
        </h3>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={treeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {treeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as TreeData;
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-semibold text-text-primary">
                        {data.name}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {data.value} sessions ({data.percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label with total count */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-3xl font-bold text-text-primary">
              {totalSessions}
            </div>
            <div className="text-xs text-text-secondary mt-1">Total Trees</div>
          </div>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="mt-6 space-y-2">
        {treeData.map((tree) => (
          <div
            key={tree.name}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{tree.icon}</span>
              <span className="font-medium text-text-primary">{tree.name}</span>
              <span className="text-text-secondary text-xs">
                ({tree.label})
              </span>
            </div>
            <span className="font-semibold text-text-primary">
              {tree.value} ({tree.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
