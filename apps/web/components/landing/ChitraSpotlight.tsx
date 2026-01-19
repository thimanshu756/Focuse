'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import ChitraImage from '@/app/public/assets/Chitra_spotlight_hero.png';
import Image from 'next/image';
const highlights = [
  "Chitra doesn't just set timers—she understands your goals.",
  'She breaks complex tasks into steps you can start right now.',
  'She learns your rhythm and coaches you to work smarter, not harder.',
  'Every insight is personalized. Every recommendation is actionable.',
];

export function ChitraSpotlight() {
  return (
    <section className="py-[120px] px-5 md:px-10 bg-[#E9F0FF]/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Headline */}
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
              Meet Chitra — Your Smart Focus Assistant
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Powered by AI, designed for you.
            </p>

            {/* Bullet Points */}
            <div className="space-y-4">
              {highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-lg text-text-primary">{highlight}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-accent/10 via-blue-100/50 to-green-100/50 overflow-hidden shadow-floating">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <Image
                  src={ChitraImage}
                  alt="Chitra"
                  width={500}
                  height={500}
                />
              </div>

              {/* Decorative floating elements */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-12 right-12 w-16 h-16 bg-accent/20 rounded-2xl backdrop-blur-sm"
              />
              <motion.div
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                className="absolute bottom-16 left-12 w-20 h-20 bg-blue-200/30 rounded-full backdrop-blur-sm"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
