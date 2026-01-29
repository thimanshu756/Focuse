export const COLORS = {
  primary: {
    accent: '#D7F50A',
    soft: '#E9FF6A',
  },
  background: {
    gradient: '#EAF2FF',
    gradientEnd: '#E6FFE8',
    card: '#F6F9FF',
    cardBlue: '#E9F0FF',
    cardDark: '#111111',
  },
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    muted: '#94A3B8',
    white: '#FFFFFF',
  },
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  // Session-specific dark theme (premium, calm feel)
  session: {
    background: '#0C1220', // Deep navy instead of pure black
    backgroundSecondary: '#141E30', // Slightly lighter navy
    card: 'rgba(255, 255, 255, 0.06)', // Subtle glass effect
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.4)',
    ring: {
      background: 'rgba(255, 255, 255, 0.1)',
      active: '#D7F50A',
      urgent: '#EF4444',
    },
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BORDER_RADIUS = {
  sm: 12,
  md: 16,
  lg: 24,
  pill: 9999,
} as const;

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 32,
  display: 40,
} as const;

export const FONT_WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const SHADOWS = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  floating: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
} as const;
