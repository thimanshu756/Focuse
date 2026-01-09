import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#D7F50A',
          soft: '#E9FF6A',
        },
        bg: {
          card: '#F6F9FF',
          'card-blue': '#E9F0FF',
          'card-dark': '#111111',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
          'on-dark': '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '999px',
      },
      boxShadow: {
        card: '0 8px 24px rgba(15, 23, 42, 0.08)',
        floating: '0 12px 32px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
export default config;
