'use client';

import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How does Chitra AI actually help?',
    answer:
      'Most timers are dumb. Chitra is smart. Tell it "I need to study history", and it breaks that big goal into 4 focused sessions with specific objectives like "Read Chapter 1" and "Review Notes".',
  },
  {
    question: 'Does the forest sync to my phone?',
    answer:
      'Yes. Your forest is cloud-synced. Start growing a tree on your laptop in the library, and finish it on your phone on the bus ride home.',
  },
  {
    question: 'Is the free plan enough?',
    answer:
      'For most people, yes. You get the timer, basic tracking, and the forest visualization. PRO unlocks unlimited AI breakdowns and deep historical analytics.',
  },
  {
    question: 'Can I listen to music while focusing?',
    answer:
      'Focuse has built-in LoFi beats and ambient forest sounds that auto-play when your timer starts. You can also mute them and use your own music.',
  },
];

export const FAQBento = () => {
  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">
          Common Questions
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent-dark mb-4">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-3">
              {faq.question}
            </h3>
            <p className="text-text-secondary leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
