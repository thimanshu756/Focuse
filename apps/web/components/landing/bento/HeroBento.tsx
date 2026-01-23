'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Sprout } from 'lucide-react';

export const HeroBento = () => {
  return (
    <section className="w-full px-4 py-8 lg:py-16 mx-auto max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 min-h-[600px]">
        {/* Main Value Prop - Large Block */}
        <div className="md:col-span-8 bg-white rounded-3xl p-8 lg:p-12 shadow-card flex flex-col justify-center relative overflow-hidden group">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent-dark font-medium text-sm mb-6 border border-accent/20">
              <Sparkles className="w-4 h-4 fill-current text-accent-dark" />
              <span>Meet Chitra: Your AI Focus Coach</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-display font-bold text-text-primary tracking-tight mb-6 leading-[1.1]">
              Turn Big Goals into <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-dark to-green-600">
                Daily Momentum.
              </span>
            </h1>
            <p className="text-lg text-text-secondary mb-8 max-w-lg leading-relaxed">
              Stop feeling overwhelmed.{' '}
              <strong className="text-text-primary font-semibold">
                Chitra
              </strong>{' '}
              breaks down your tasks, and your focus grows a virtual forest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-accent text-text-primary font-bold transition-transform active:scale-95 hover:shadow-lg hover:shadow-accent/20 border border-transparent hover:border-black/5"
              >
                Start Focusing Free
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-white border border-gray-200 text-text-primary font-semibold transition-colors hover:bg-gray-50 hover:border-gray-300"
              >
                How It Works
              </Link>
            </div>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -right-20 -bottom-40 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        </div>

        {/* Visual Block 1 - Chitra Interaction */}
        <div className="md:col-span-4 bg-[#F6F9FF] rounded-3xl overflow-hidden shadow-card relative group min-h-[350px] flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="/hero-chitra-plant.png"
              alt="Chitra AI Plant Assistant"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              priority
            />
          </div>

          <div className="absolute top-6 left-6 right-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/50">
              <p className="text-sm font-medium text-text-primary">
                "Ready to crush your goals today?"
              </p>
            </div>
          </div>
        </div>

        {/* Visual Block 2 - Focus Streak */}
        <div className="md:col-span-4 bg-white rounded-3xl shadow-card flex flex-col justify-between group overflow-hidden relative border border-gray-100 h-full min-h-[200px]">
          <div className="flex justify-between items-start mb-2 relative z-10 p-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Your Streak
              </h3>
              <p className="text-sm text-text-muted">Consistency is key</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="relative w-full flex-grow flex items-center justify-center mt-2">
            <Image
              src="/hero-streak-card.png"
              alt="Focus Streak Card"
              width={300}
              height={100}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 drop-shadow-md"
            />
          </div>
        </div>

        {/* Trust Block */}
        <div className="md:col-span-5 bg-[#111111] rounded-3xl p-8 shadow-card flex flex-col justify-center text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex -space-x-4 mb-6 pl-2">
              {[
                '/people/chahar.jpeg',
                '/people/grover.jpeg',
                '/people/himanshu.jpeg',
                '/people/hitakshi.jpeg',
                '/people/hridyesh.jpeg',
                '/people/prashant.jpeg',
              ].map((avatar, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-2 border-[#111] bg-slate-700 overflow-hidden relative"
                >
                  <Image
                    src={avatar}
                    alt={`Member ${i + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-2 border-[#111] bg-accent flex items-center justify-center text-black font-bold text-xs relative z-10">
                12k+
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2 group-hover:text-accent transition-colors">
              Join the Tribe
            </h3>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p>12,000+ active forest growers</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
        </div>

        {/* Micro-Interaction / Callout */}
        <div className="md:col-span-3 bg-gradient-to-br from-[#E9F0FF] to-[#F0FDF4] rounded-3xl p-6 shadow-card flex flex-col items-center justify-center text-center border border-white/50 relative overflow-hidden">
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/20 rounded-full blur-2xl -mr-10 -mt-10" />

          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-green-600 mb-4 shadow-sm relative z-10">
            <Sparkles className="w-7 h-7 fill-green-100" />
          </div>
          <h3 className="font-bold text-text-primary relative z-10">
            AI Coaching
          </h3>
          <p className="text-sm text-text-secondary mt-1 relative z-10">
            Weekly insights tailored to you
          </p>
        </div>
      </div>
    </section>
  );
};
