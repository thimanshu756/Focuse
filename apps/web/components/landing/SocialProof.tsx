'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Stat {
  value: string;
  label: string;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

const stats: Stat[] = [
  { value: '12,000+', label: 'Active Users' },
  { value: '250,000+', label: 'Sessions Completed' },
  { value: '4.8/5', label: 'Average Rating' },
];

const testimonials: Testimonial[] = [
  {
    quote:
      'Chitra helped me break down my thesis into manageable chunks. I finished 3 weeks early!',
    name: 'Priya',
    role: 'Graduate Student',
    avatar: 'P',
  },
  {
    quote:
      "The forest visualization is addictive. I haven't missed a day in 2 months.",
    name: 'Arjun',
    role: 'Developer',
    avatar: 'A',
  },
  {
    quote: 'Weekly insights showed me I work best in mornings. Game changer.',
    name: 'Maya',
    role: 'Freelancer',
    avatar: 'M',
  },
];

export function SocialProof() {
  return (
    <section className="py-[120px] px-5 md:px-10">
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
            Join Thousands Growing Their Focus Forest
          </h2>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-5xl sm:text-6xl font-bold text-text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-lg text-text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-[#F6F9FF] rounded-3xl p-8 shadow-card"
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-accent text-accent" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-text-primary mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* Avatar Placeholder */}
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-text-primary font-semibold text-lg">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-text-primary">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
