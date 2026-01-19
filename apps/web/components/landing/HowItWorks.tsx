'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import ChitraBreakingDownImage from '@/app/public/assets/Chitra_breaking_down_tasks.png';
import ForestGrowthImage from '@/app/public/assets/Forest_growth_visualization.png';
import AnalyticsDashboardImage from '@/app/public/assets/Analytics_dashboard_with_Chitra.png';
import { StaticImageData } from 'next/image';

interface Step {
  title: string;
  description: string;
  image: StaticImageData;
  imagePosition: 'left' | 'right';
}

const steps: Step[] = [
  {
    title: 'Break Down with Chitra',
    description:
      'Meet Chitra—your AI assistant. Describe any goal, and Chitra breaks it into actionable subtasks with realistic time estimates. No more guesswork.',
    image: ChitraBreakingDownImage,
    imagePosition: 'right',
  },
  {
    title: 'Focus & Grow Your Forest',
    description:
      'Start a session. Every completed focus block grows a tree. Watch your forest flourish as you build streaks and momentum.',
    image: ForestGrowthImage,
    imagePosition: 'left',
  },
  {
    title: 'Get AI-Powered Insights',
    description:
      'Chitra analyzes your patterns and delivers personalized coaching: your best focus windows, ideal session lengths, and weekly action plans.',
    image: AnalyticsDashboardImage,
    imagePosition: 'right',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-[120px] px-5 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
            Three Steps to Smarter Focus
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${
                step.imagePosition === 'left' ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Text Content */}
              <div
                className={`${
                  step.imagePosition === 'right' ? 'lg:order-1' : 'lg:order-2'
                }`}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent text-white font-bold text-lg mb-6 shadow-md">
                  {index + 1}
                </div>
                <h3 className="text-3xl sm:text-4xl font-semibold text-text-primary mb-4">
                  {step.title}
                </h3>
                <p className="text-lg text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Image Placeholder */}
              <div
                className={`${
                  step.imagePosition === 'right' ? 'lg:order-2' : 'lg:order-1'
                }`}
              >
                <div className="relative aspect-[4/3] rounded-3xl bg-[#E9F0FF] overflow-hidden shadow-card">
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center">
                      <Image
                        src={step.image}
                        alt={step.title}
                        width={500}
                        height={500}
                      />
                    </div>
                  </div>

                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
