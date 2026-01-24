'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight, Brain, Sprout, Smartphone, Zap } from 'lucide-react';

export const FeaturesBento = () => {
  return (
    <section id="features" className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">
          Everything You Need to <br />
          <span className="text-accent-dark">Stay in the Flow</span>
        </h2>
        <p className="text-lg text-text-secondary">
          Focuse combines smart AI task management with rewarding gamification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
        {/* Feature 1: Chitra AI (Large) */}
        <div className="md:col-span-2 bg-[#FAFAFA] rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-card transition-all duration-300">
          <div className="relative z-10 max-w-lg">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-accent-dark">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-3">
              AI Task Breakdown
            </h3>
            <p className="text-text-secondary mb-6">
              Overwhelmed? Just tell Chitra your goal. She instantly breaks it
              down into actionable steps, tagged and timed for you.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 w-3/4 h-3/4 translate-x-1/4 translate-y-1/4 group-hover:translate-x-1/6 group-hover:translate-y-1/6 transition-transform duration-500">
            <Image
              src="/feature-ai-breakdown.png"
              alt="AI Task Breakdown Interface"
              fill
              className="object-contain object-bottom"
            />
          </div>
        </div>

        {/* Feature 2: Forest Growth (Tall) */}
        <div className="md:row-span-2 bg-gradient-to-b from-[#F0FDF4] to-[#DCFCE7] rounded-3xl p-8 shadow-sm border border-green-100 relative overflow-hidden group hover:shadow-card transition-all duration-300 flex flex-col">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-green-600">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-3">
            Grow Your Forest
          </h3>
          <p className="text-green-800 mb-8">
            Every 25 minutes of focus plants a tree in your digital forest.
            Watch your productivity come to life.
          </p>
          <div className="relative flex-grow min-h-[200px] w-full mt-auto">
            <Image
              src="/feature-forest-growth.png"
              alt="Digital Forest Growing"
              fill
              className="object-contain object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Feature 3: Analytics (Square) */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-card transition-all duration-300">
          <h3 className="text-xl font-bold text-text-primary mb-2">
            Deep Analytics
          </h3>
          <p className="text-text-secondary text-sm mb-4">
            Track your peak flow hours.
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-48 opacity-80 group-hover:opacity-100 transition-opacity">
            <Image
              src="/feature-analytics-graph.png"
              alt="Analytics Graph"
              fill
              className="object-cover "
            />
          </div>
        </div>

        {/* Feature 4: Cross Device (Square) */}
        <div className="bg-[#111111] rounded-3xl p-8 shadow-sm relative overflow-hidden group hover:shadow-card transition-all duration-300 text-white flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Sync Anywhere</h3>
            <p className="text-gray-400 text-sm">Mobile. Desktop. Tablet.</p>
          </div>
          <div className="flex items-center gap-2 text-accent text-sm font-medium mt-4 group-hover:translate-x-2 transition-transform cursor-pointer">
            <span>Fully Responsive</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>

          {/* Decorative blob */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </section>
  );
};
