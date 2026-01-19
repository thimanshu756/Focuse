'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SessionStats } from '@/types/insights.types';
import { generateAdvancedInsight } from '@/utils/insights-ai';

interface AIInsightsCardProps {
  stats: SessionStats;
  isPro: boolean;
}

export function AIInsightsCard({ stats, isPro }: AIInsightsCardProps) {
  const router = useRouter();
  const insight = generateAdvancedInsight(stats);

  if (isPro) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-br from-yellow-50 via-white to-green-50 border border-yellow-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">✨</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-text-primary">
                AI Insights
              </h3>
              <p className="text-xs text-text-secondary">
                Powered by your productivity data
              </p>
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium flex-shrink-0">
              PRO
            </span>
          </div>

          <p className="text-base text-text-secondary leading-relaxed mb-4">
            {insight}
          </p>

          {/* Optional: Action button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Could navigate to recommendations page
              // router.push('/insights/recommendations');
            }}
            className="text-sm text-yellow-700 hover:text-yellow-800 font-medium"
          >
            View recommendations →
          </Button>
        </Card>
      </motion.div>
    );
  }

  // FREE user locked card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 relative overflow-hidden">
        {/* Blurred background insight */}
        <div className="absolute inset-0 blur-md opacity-50 pointer-events-none p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                AI Insights
              </h3>
              <p className="text-xs text-gray-500">
                Powered by your productivity data
              </p>
            </div>
          </div>
          <p className="text-base text-gray-700 leading-relaxed">
            Your focus improved significantly this month. Keep up the great
            work!
          </p>
        </div>

        {/* Upgrade overlay */}
        <div className="relative z-10 text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
            <span className="text-3xl">✨</span>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Unlock AI Insights
          </h3>
          <p className="text-text-secondary mb-6 max-w-sm mx-auto">
            Get personalized recommendations and productivity insights powered
            by AI
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/pricing')}
          >
            Upgrade to PRO
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
