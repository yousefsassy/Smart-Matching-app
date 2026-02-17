// SmartMatch Theme - "Intelligent Trust" Premium Design System
// Deep blues, soft whites, gradient accents with a modern, trustworthy feel

import { StyleSheet, Platform } from 'react-native';

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
    goldLight: '#FFF8E1',
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
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Gradients (as array for LinearGradient)
  gradients: {
    primary: ['#3D9DED', '#1F5E9B'],
    hero: ['#0A2449', '#1F5E9B', '#3D9DED'],
    accent: ['#00D4AA', '#3D9DED'],
    success: ['#10B981', '#059669'],
    warmGlow: ['#FFB347', '#FF6B6B'],
    card: ['#FFFFFF', '#F8FAFC'],
    dark: ['#0F172A', '#1E293B'],
  },
};

export const typography = {
  // Font families - Platform-aware system fonts
  fontFamily: Platform.select({
    ios: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
    default: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
  })!,

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

  // Line heights (absolute values for common sizes)
  lineHeight: {
    xs: 16,    // size.xs * ~1.45
    sm: 18,    // size.sm * ~1.38
    base: 22,  // size.base * ~1.47
    md: 24,    // size.md * ~1.41
    lg: 28,    // size.lg * 1.4
    xl: 32,    // size.xl * ~1.33
    '2xl': 36, // size['2xl'] * ~1.29
    '3xl': 42, // size['3xl'] * ~1.24
    '4xl': 50, // size['4xl'] * ~1.19
    // Multiplier aliases
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,    // Large headings (3xl, 4xl)
    normal: 0,      // Body text
    wide: 0.5,      // Section labels
    wider: 1.0,     // Uppercase labels
    widest: 1.5,    // All-caps badges
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
  '6xl': 80,
  '7xl': 96,
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

export const borderWidth = {
  hairline: StyleSheet.hairlineWidth,
  thin: 1,
  default: 1.5,
  thick: 2,
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
  input: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  tabBar: {
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const animations = {
  duration: {
    instant: 100,
    fast: 150,
    normal: 250,
    slow: 400,
    deliberate: 600,
  },
  spring: {
    snappy: { damping: 15, stiffness: 300, mass: 1 },
    gentle: { damping: 15, stiffness: 200, mass: 1 },
    bouncy: { damping: 12, stiffness: 180, mass: 0.8 },
    stiff: { damping: 20, stiffness: 350, mass: 1 },
  },
  press: {
    scaleDown: 0.97,
    scaleDownSubtle: 0.98,
  },
};

const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  borderWidth,
  shadows,
  animations,
};

export default theme;
