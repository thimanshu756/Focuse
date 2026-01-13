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
      keyframes: {
        drift: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100vw)' },
        },
        'float-up': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': {
            transform: 'translateY(-100vh) rotate(360deg)',
            opacity: '0',
          },
        },
        'firefly-float': {
          '0%, 100%': { transform: 'translate(0, 0)', opacity: '0.3' },
          '25%': { transform: 'translate(20px, -30px)', opacity: '1' },
          '50%': { transform: 'translate(-15px, -50px)', opacity: '0.8' },
          '75%': { transform: 'translate(10px, -20px)', opacity: '1' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        drift: 'drift linear infinite',
        'float-up': 'float-up ease-in-out infinite',
        'firefly-float': 'firefly-float ease-in-out infinite',
        twinkle: 'twinkle ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
