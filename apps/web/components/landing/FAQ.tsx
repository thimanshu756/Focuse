'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What makes FOCUSE different from other timers?',
    answer:
      'FOCUSE combines three powerful features: Chitra AI assistant for task breakdown, beautiful forest visualization that grows with your progress, and personalized insights that help you work smarter. Most timers just count down—we help you understand and improve your focus patterns.',
  },
  {
    question: "How does Chitra's AI task breakdown work?",
    answer:
      'Simply describe your goal in natural language (e.g., "Write a blog post about productivity"). Chitra analyzes your request and generates actionable subtasks with realistic time estimates in seconds. You can then start focus sessions directly from these AI-generated tasks.',
  },
  {
    question: 'Can I use FOCUSE across devices?',
    answer:
      'Yes! PRO users get seamless cross-device sync. Start a session on your desktop, continue on mobile, and all your progress, trees, and insights sync automatically across all devices.',
  },
  {
    question: 'What happens to my trees if I fail a session?',
    answer:
      "If you abandon a focus session early, the tree withers—but you can start fresh immediately. This gentle accountability helps build consistency. Your streak counter encourages you to maintain momentum, but there's no penalty for getting back on track.",
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Absolutely! Cancel your PRO subscription anytime with a single click. No penalties, no questions asked. Your account automatically reverts to the free tier, and you keep all your historical data and trees.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-[120px] px-5 md:px-10 bg-[#F6F9FF]">
      <div className="max-w-4xl mx-auto">
        {/* Section Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-text-primary mb-4">
            Questions? We've Got Answers.
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-2xl overflow-hidden transition-all ${
                openIndex === index
                  ? 'border-l-4 border-accent'
                  : 'border-l-4 border-transparent'
              }`}
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                aria-expanded={openIndex === index}
              >
                <span className="text-lg font-semibold text-text-primary pr-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown size={24} className="text-text-secondary" />
                </motion.div>
              </button>

              {/* Answer Content */}
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-2">
                      <p className="text-text-secondary leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
