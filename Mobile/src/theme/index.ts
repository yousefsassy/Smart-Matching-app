// TawTaw Theme - luxury editorial mobile system
// Midnight structure, parchment surfaces, metallic amber accents

import { StyleSheet, Platform } from 'react-native';

export const colors = {
  // Primary palette - Deep ink blue
  primary: {
    50: '#EEF3F9',
    100: '#D4DDEA',
    200: '#AFBFD7',
    300: '#839EC0',
    400: '#557AA3',
    500: '#335C82',
    600: '#22435F',
    700: '#182F45',
    800: '#0D1B2C',
    900: '#050B13',
  },

  // Accent palette
  accent: {
    mustard:      '#CF9831',
    mustardLight: '#F8EFDF',
    amber:        '#E8B24E',
    amberLight:   '#FFF4DE',
    coral:        '#C7664D',
    coralLight:   '#F6E5DF',
    gold:         '#CF9831',
    goldLight:    '#F8EFDF',
    cyan:         '#157A73',
    cyanLight:    '#E1F1EE',
    purple:       '#8B5CF6',
    purpleLight:  '#EDE9FE',
  },

  // Neutrals — Warm sand / ivory system
  neutral: {
    0:   '#FFFDF9',
    50:  '#F6F0E7',
    100: '#E9DED0',
    200: '#D7C6B0',
    300: '#BFA88B',
    400: '#9D8367',
    500: '#7C644E',
    600: '#5E4937',
    700: '#423226',
    800: '#2B211A',
    900: '#17110D',
  },

  surface: {
    base: '#F6F0E7',
    raised: '#FFFDF9',
    muted: '#EFE5D8',
    sunken: '#E6D8C5',
    tint: '#E8EDF4',
    accent: '#F8EFDF',
  },

  overlay: {
    heroSoft: 'rgba(5, 11, 19, 0.24)',
    heroMid: 'rgba(5, 11, 19, 0.58)',
    heroStrong: 'rgba(5, 11, 19, 0.9)',
    glassSoft: 'rgba(255,255,255,0.12)',
    glass: 'rgba(255,255,255,0.16)',
    glassStrong: 'rgba(255,255,255,0.22)',
    borderSoft: 'rgba(255,255,255,0.16)',
    border: 'rgba(255,255,255,0.24)',
    borderStrong: 'rgba(255,255,255,0.34)',
    darkScrim: 'rgba(5, 11, 19, 0.68)',
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
    primary:  ['#22435F', '#182F45'],
    hero:     ['#050B13', '#0D1B2C', '#22435F'],
    accent:   ['#E8B24E', '#CF9831'],
    success:  ['#157A73', '#0F5D59'],
    warmGlow: ['#F0C36C', '#CF9831'],
    card:     ['#FFFDF9', '#F1E7D9'],
    dark:     ['#050B13', '#182F45'],
    mustard:  ['#E8B24E', '#CA8A18'],
    header:   ['#050B13', '#0D1B2C', '#22435F'],
    cardHero: ['#13243A', '#244C70'],
    surface:  ['#FFFDF9', '#EDE2D3'],
    coral:    ['#C7664D', '#A54B36'],
    teal:     ['#157A73', '#0F5D59'],
    sidebar:  ['#ECE2D4', '#FFFDF9'],
  },
};

export const typography = {
  // Font families - custom fonts only for selective brand moments
  fontFamily: Platform.select({
    ios: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
      brand: 'Beckan',
      accent: 'SilverGarden',
    },
    default: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
      brand: 'Beckan',
      accent: 'SilverGarden',
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

  role: {
    heroTitle: {
      fontSize: 34,
      lineHeight: 40,
      letterSpacing: -1.1,
      fontWeight: '700' as const,
    },
    sectionTitle: {
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: -0.55,
      fontWeight: '700' as const,
    },
    cardTitle: {
      fontSize: 16,
      lineHeight: 22,
      letterSpacing: -0.2,
      fontWeight: '700' as const,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400' as const,
    },
    meta: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as const,
    },
    eyebrow: {
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 1.2,
      fontWeight: '600' as const,
    },
    display: {
      fontSize: 48,
      lineHeight: 52,
      letterSpacing: -1.8,
      fontWeight: '700' as const,
    },
    deck: {
      fontSize: 17,
      lineHeight: 26,
      fontWeight: '500' as const,
      letterSpacing: -0.15,
    },
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
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 5,
  },
  lg: {
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 11,
  },
  glow: {
    shadowColor: colors.accent.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  mustard: {
    shadowColor: colors.accent.mustard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  card: {
    shadowColor: colors.primary[800],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 3,
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
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 12,
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
