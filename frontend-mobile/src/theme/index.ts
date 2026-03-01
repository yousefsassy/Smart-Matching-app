// SmartMatch Theme - "Mediterranean Artisan" Design System
// Dark cerulean trust blues, warm old lace backgrounds, mustard & CG red accents

import { StyleSheet, Platform } from 'react-native';

export const colors = {
  // Primary palette - Dark Cerulean (#134686 anchor)
  primary: {
    50: '#EBF1FA',   // Tinted backgrounds, icon wells
    100: '#C8D9F2',  // Borders, dividers
    200: '#9FBDE8',  // Disabled states
    300: '#6E9BD8',  // Placeholder text
    400: '#4479C7',  // Hover/pressed states
    500: '#2660AF',  // Interactive elements (focus rings, links)
    600: '#134686',  // ← THE brand cerulean (active tint, headers)
    700: '#0E3366',  // Pressed/active button states
    800: '#092247',  // Dark headings
    900: '#050F1E',  // Deep navy — gradient backgrounds, auth screens
  },

  // Accent — Mustard, CG Red, Mediterranean Teal
  accent: {
    // Mustard — primary CTA, highlights, energy
    mustard:      '#FEB21A',
    mustardLight: '#FFF4D6',
    // CG Red — promotions, hot badges, alerts
    coral:        '#ED3F27',
    coralLight:   '#FDECEA',
    // Semantic aliases used by statusConfig (keys must be preserved)
    gold:         '#FEB21A',   // mustard alias — pending status badge
    goldLight:    '#FFF4D6',
    // Mediterranean teal — accepted status badge, AI highlights
    cyan:         '#0EA5A0',
    cyanLight:    '#E0F7F6',
    // Purple — kept for ProviderDashboard stats
    purple:       '#8B5CF6',
    purpleLight:  '#EDE9FE',
  },

  // Neutrals — Warm sand tones (neutral[50] = Old Lace app background)
  neutral: {
    0:   '#FFFFFF',  // Pure white — cards, modals, surfaces
    50:  '#FDF4E3',  // ← OLD LACE — main app background (auto-cascades everywhere)
    100: '#F5E8CC',  // Input backgrounds, subtle borders
    200: '#E8D4AA',  // Dividers
    300: '#D4B887',  // Disabled text
    400: '#B09060',  // Placeholder text
    500: '#8A6E45',  // Secondary text
    600: '#6B5234',  // Body text
    700: '#4F3B24',  // Dark body text
    800: '#342518',  // Headings
    900: '#1A110A',  // Near black
  },

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#FEB21A',
  warningLight: '#FFF4D6',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#134686',
  infoLight: '#EBF1FA',

  // Gradients (as array for LinearGradient)
  gradients: {
    primary:  ['#2660AF', '#134686'],              // Cerulean button gradient
    hero:     ['#050F1E', '#0E3366', '#134686'],   // Auth screen headers
    accent:   ['#FEB21A', '#ED3F27'],              // Mustard → CG red (energy)
    success:  ['#10B981', '#059669'],              // Unchanged
    warmGlow: ['#FEB21A', '#ED3F27'],              // Mustard → red (replaces gold/coral)
    card:     ['#FFFFFF', '#FDF4E3'],              // White → old lace (warm cards)
    dark:     ['#050F1E', '#0E3366'],              // Deep navy
    mustard:  ['#FEB21A', '#F59500'],              // Pure mustard CTA gradient
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
