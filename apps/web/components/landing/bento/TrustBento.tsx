'use client';

const companies = [
  'TechFlow',
  'Studio Girth',
  'Creative Inc',
  'IndieHackers',
  'ProductHunt',
];

export const TrustBento = () => {
  return (
    <section className="py-12 border-t border-b border-gray-100 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm font-semibold text-text-muted uppercase tracking-widest mb-8">
          Trusted by productive teams worldwide
        </p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {companies.map((company, i) => (
            <div
              key={i}
              className="text-xl font-bold font-display text-text-primary"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
