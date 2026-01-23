'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const FinalCTABento = () => {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <div className="relative bg-[#111111] rounded-[40px] p-8 md:p-16 overflow-hidden shadow-2xl text-white group">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 to-black z-0" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-accent/5 to-transparent pointer-events-none" />

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
              Your Best Work <br />
              <span className="text-accent">Starts Now.</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto md:mx-0">
              Join 12,000+ creators who have planted over 500,000 digital trees.
              It's time to get focused.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-accent text-black font-bold text-lg hover:bg-accent-soft hover:scale-105 transition-all shadow-lg hover:shadow-accent/50"
              >
                Start Your Forest
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <p className="text-sm text-gray-500 mt-4 sm:mt-0 flex items-center justify-center">
                No credit card required
              </p>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative h-[400px] flex items-center justify-center">
            <div className="absolute inset-0 bg-accent/10 rounded-full blur-[60px] animate-pulse" />
            <Image
              src="/hero-chitra-plant.png"
              alt="Chitra Plant Celebrating"
              fill
              className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
