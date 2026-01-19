'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Play } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-[120px] px-5 md:px-10 bg-gradient-to-b from-[#EAF2FF] to-[#E6FFE8] relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6"
        >
          Your Best Work Starts Now
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg sm:text-xl text-text-secondary mb-12 max-w-2xl mx-auto"
        >
          Join FOCUSE today and let Chitra guide you to smarter, calmer
          productivity.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold bg-accent text-text-primary rounded-full hover:bg-accent-soft transition-all shadow-lg hover:shadow-xl"
            >
              Start Your Free Account
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 text-lg font-semibold bg-white text-text-primary border-2 border-accent rounded-full hover:bg-accent/10 transition-all shadow-md"
            >
              See Pricing
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -z-0" />
    </section>
  );
}
