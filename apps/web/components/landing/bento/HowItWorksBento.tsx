'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

/*
  IMAGE GENERATION PROMPTS FOR USER:

  1. for /how-input-chitra.png:
     "3D cartoon render of a cute, friendly robot mascot named Chitra, holding a digital clipboard and listening attentively. The robot has big expressive eyes and a soft, clay-like texture. Background is a soft pastel blue with floating speech bubbles containing simple icons like a lightbulb or a pencil. High quality, 3D character design, Disney/Pixar style lighting."

  2. for /how-timer.png:
     "3D cartoon render of a round whimsical timer set to 25:00, sitting on a floating island of grass. Out of the top of the timer, a vibrant, stylized low-poly green tree is sprouting. Magical sparkles and floating musical notes surround it (indicating flow). Pastel green and yellow color palette. Gamified, fun, productive vibe."

  3. for /how-report.png:
     "A 3D render of a floating, translucent glass tablet displaying a glowing weekly report. On the screen, a playful line graph rises smoothly, with a gold 'Level Up!' medal hovering above it. Magical sparkles and soft floating data particles surround the tablet. The background is a dreamy pastel violet. High-tech but cute and approachable design."
*/

export const HowItWorksBento = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section
      id="how-it-works"
      className="py-24 px-4 max-w-7xl mx-auto overflow-hidden"
    >
      <div className="text-center mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 font-bold text-sm mb-6 border-2 border-green-200"
        >
          <Sparkles className="w-4 h-4" />
          <span>IT'S LIKE A GAME</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-black text-text-primary mb-6 tracking-tight"
        >
          Grow Your Focus <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400">
            One Tree at a Time
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl text-text-secondary max-w-2xl mx-auto font-medium"
        >
          Chitra turns your to-do list into a thriving forest. No stress, just
          play.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* Connecting Dotted Line (Desktop) */}
        <div className="hidden md:block absolute top-[160px] left-[10%] right-[10%] border-t-4 border-dashed border-gray-200 -z-10" />

        {/* Step 1 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div className="bg-[#E0F2FE] rounded-[2.5rem] p-4 pb-0 h-[420px] shadow-sm border-2 border-blue-100/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden">
            <div className="bg-white/60 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center font-black text-xl text-blue-500 absolute top-6 left-6 z-20 border-2 border-white">
              1
            </div>
            <div className="relative w-full flex-grow mt-8">
              {/* Placeholder for /how-input-chitra.png */}
              <Image
                src="/how-input-chitra.png"
                alt="Step 1: Tell Chitra"
                fill
                className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
          <div className="mt-6 text-center px-4">
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              Break Down with Chitra
            </h3>
            <p className="text-text-secondary font-medium">
              Chat with your AI buddy. "I want to pass my math test."
            </p>
          </div>
        </motion.div>

        {/* Step 2 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="relative group md:-mt-12" // Staggered layout
        >
          <div className="bg-[#F0FDF4] rounded-[2.5rem] p-4 pb-0 h-[420px] shadow-sm border-2 border-green-100/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden">
            <div className="bg-white/60 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center font-black text-xl text-green-500 absolute top-6 left-6 z-20 border-2 border-white">
              2
            </div>
            <div className="relative w-full flex-grow mt-8">
              {/* Placeholder for /how-timer.png */}
              <Image
                src="/how-timer.png"
                alt="Step 2: Focus & Grow"
                fill
                className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
          <div className="mt-6 text-center px-4">
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              Focus & Grow Your Forest
            </h3>
            <p className="text-text-secondary font-medium">
              Start the timer. A tree grows as you work. Don't kill it!
            </p>
          </div>
        </motion.div>

        {/* Step 3 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="relative group"
        >
          <div className="bg-[#FAF5FF] rounded-[2.5rem] p-4 pb-0 h-[420px] shadow-sm border-2 border-purple-100/50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden">
            <div className="bg-white/60 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center font-black text-xl text-purple-500 absolute top-6 left-6 z-20 border-2 border-white">
              3
            </div>
            <div className="relative w-full flex-grow mt-8">
              {/* Placeholder for /how-report.png */}
              <Image
                src="/how-report.png"
                alt="Step 3: Level Up"
                fill
                className="object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
          <div className="mt-6 text-center px-4">
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              Get Chitra-Powered Insights
            </h3>
            <p className="text-text-secondary font-medium">
              Chitra analyzes your patterns and delivers personalized coaching
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
