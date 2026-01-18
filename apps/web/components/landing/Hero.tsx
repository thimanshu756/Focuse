'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Play } from 'lucide-react';
import Image from 'next/image';
import HeroImage from '@/app/public/assets/hero_main.png';
export function Hero() {
  const scrollToDemo = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // For now, this will just be a placeholder
    // You can add a demo video/section later
    console.log('Demo section coming soon');
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 px-5 md:px-10">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-text-primary leading-tight mb-6">
              Turn Goals Into Progress,{' '}
              <span className="text-text-primary">Minutes Into Momentum</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-text-secondary mb-8 max-w-2xl mx-auto lg:mx-0">
              FOCUSE is your AI-powered focus companion. Break down tasks with
              Chitra, grow your forest with every session, and unlock insights
              that transform how you work.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-accent text-text-primary rounded-full hover:bg-accent-soft transition-all shadow-md hover:shadow-lg"
                >
                  Start Focusing Free
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="#demo"
                  onClick={scrollToDemo}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold bg-white text-text-primary border-2 border-accent rounded-full hover:bg-accent/10 transition-all shadow-sm"
                >
                  <Play size={20} />
                  See How It Works
                </a>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-12 flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-text-muted"
            >
              <div className="flex items-center gap-2">
                <span className="text-accent text-xl">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent text-xl">✓</span>
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent text-xl">✓</span>
                <span>12,000+ active users</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Hero Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className=""
          >
            <div className=" aspect-square max-w-lg mx-auto">
              {/* Placeholder for hero illustration */}
              <div className="w-full h-full rounded-3xl bg-gradient-to-br from-accent/20 via-blue-100/50 to-green-100/50 flex items-center justify-center shadow-floating">
                <Image
                  src={HeroImage}
                  alt="Hero Illustration"
                  className="w-full h-full "
                  width={800}
                  height={800}
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl -z-10" />
    </section>
  );
}
