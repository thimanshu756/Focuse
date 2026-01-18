'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  Timer,
  Smartphone,
  BarChart3,
  Compass,
  FileText,
  LucideIcon,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: 'AI Task Breakdown',
    description: 'Chitra turns vague goals into clear, time-boxed plans.',
  },
  {
    icon: Timer,
    title: 'Focus Timer',
    description:
      'Pomodoro-style sessions that grow your forest with every win.',
  },
  {
    icon: Smartphone,
    title: 'Cross-Device Sync',
    description:
      'Start on desktop, continue on mobile. Your progress follows you.',
  },
  {
    icon: BarChart3,
    title: 'Session Analytics',
    description: 'Track streaks, focus time, and completion rates at a glance.',
  },
  {
    icon: Compass,
    title: 'Personalized Coaching',
    description: 'AI recommendations based on your unique work patterns.',
  },
  {
    icon: FileText,
    title: 'Weekly Insights',
    description:
      'Chitra delivers actionable weekly reports and next-week plans.',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-[120px] px-5 md:px-10 bg-white/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
            Everything You Need to Stay in Flow
          </h2>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <div className="h-full bg-[#F6F9FF] rounded-2xl p-8 transition-shadow duration-300 hover:shadow-floating">
                  {/* Icon with accent dot */}
                  <div className="relative inline-block mb-6">
                    <div className="p-4 bg-white rounded-xl shadow-sm">
                      <Icon size={32} className="text-text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
                  </div>

                  {/* Title */}
                  <h4 className="text-xl font-semibold text-text-primary mb-3">
                    {feature.title}
                  </h4>

                  {/* Description */}
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
