// SmartMatch Theme - "Trust + AI" Premium Design System
// Deep blues, soft whites, gradient accents with a modern, trustworthy feel

export const colors = {
  // Primary palette - Deep trust blues
  primary: {
    50: '#E8F4FD',
    100: '#C5E3FA',
    200: '#9ED0F7',
    300: '#77BCF3',
    400: '#5AACF0',
    500: '#3D9DED', // Main primary
    600: '#2E7DC4',
    700: '#1F5E9B',
    800: '#143F72',
    900: '#0A2449', // Deep navy
  },
  
  // Secondary - Warm accent for AI highlights
  accent: {
    cyan: '#00D4AA',
    cyanLight: '#E0FFF7',
    purple: '#8B5CF6',
    purpleLight: '#EDE9FE',
    coral: '#FF6B6B',
    gold: '#FFB347',
  },
  
  // Neutrals
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  
  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Gradients (as array for LinearGradient)
  gradients: {
    primary: ['#3D9DED', '#1F5E9B'],
    hero: ['#0A2449', '#1F5E9B', '#3D9DED'],
    accent: ['#00D4AA', '#3D9DED'],
    card: ['#FFFFFF', '#F8FAFC'],
    dark: ['#0F172A', '#1E293B'],
  },
};

export const typography = {
  // Font families - Using system fonts for reliability, can swap for custom
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  
  // Font sizes
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 42,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font weights (numeric for RN)
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const borderRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 28,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.accent.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  spring: {
    damping: 15,
    stiffness: 150,
  },
};

const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
};

export default theme;