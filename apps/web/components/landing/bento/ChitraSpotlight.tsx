'use client';

import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import Image from 'next/image';

/*
  IMAGE GENERATION PROMPT FOR USER:
  
  for /assets/Chitra_spotlight_hero.png:
  "Full-body high-quality 3D clay-render of Chitra, the cute robot mascot. Chitra is floating in mid-air, holding a glowing green holographic 'Focus' orb. Chitra is looking at the camera with a friendly, helpful expression. Soft studio lighting, pastel background elements (floating geometric shapes like spheres and rounded cubes). Pixar-style character design. High resolution, transparent background if possible or on white."
*/

const highlights = [
  {
    text: "Understand goals, don't just set timers.",
    color: 'bg-blue-100 text-blue-600',
  },
  {
    text: 'Break complex tasks into baby steps.',
    color: 'bg-green-100 text-green-600',
  },
  {
    text: 'Learn your rhythm and work smarter.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    text: 'Personalized insights that actually help.',
    color: 'bg-orange-100 text-orange-600',
  },
];

export function ChitraSpotlight() {
  return (
    <section className="py-24 px-4 md:px-10 overflow-hidden relative">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-50/50 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent-dark font-bold text-sm mb-6 border-2 border-accent/20">
              <Sparkles className="w-4 h-4" />
              <span>MEET YOUR COACH</span>
            </div>

            <h2 className="text-4xl sm:text-6xl font-black text-text-primary mb-6 tracking-tight leading-none">
              Not Just a Tool. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-dark to-green-500">
                A Focus Companion.
              </span>
            </h2>

            <p className="text-lg text-text-secondary mb-10 font-medium leading-relaxed max-w-lg">
              Chitra is the productivity partner you've always wanted. Friendly,
              smart, and always there to help you grow.
            </p>

            {/* Fun Bullet Points */}
            <div className="space-y-4">
              {highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${highlight.color}`}
                  >
                    <Check className="w-5 h-5 stroke-[3px]" />
                  </div>
                  <p className="text-base font-bold text-text-primary">
                    {highlight.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Floating Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center"
          >
            {/* Organic background shape */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E0F2FE] to-[#F0FDF4] rounded-[3rem] rotate-3 scale-90 -z-10" />

            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 p-8"
            >
              <div className="relative w-full max-w-[600px] drop-shadow-2xl">
                <Image
                  src="/Chitra_spotlight_hero.png"
                  alt="Chitra Mascot"
                  width={1000}
                  height={1000}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [10, -10, 10], rotate: [0, 10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute top-10 right-10 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl z-20"
            >
              🚀
            </motion.div>
            <motion.div
              animate={{ y: [-5, 5, -5], rotate: [0, -5, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              className="absolute bottom-20 left-10 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl z-20"
            >
              🌱
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
