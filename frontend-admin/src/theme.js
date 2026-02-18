/**
 * ============================================================
 * DESIGN TOKENS
 * ============================================================
 * Matches ../theme.ts from client-side codebase exactly.
 * All colors, spacing, typography, shadows, and radii
 * are pixel-perfect copies of the React Native design system.
 * 
 * Export as plain objects for web use (no StyleSheet.create)
 * ============================================================
 */

export const colors = {
  primary: {
    50:  '#eef2ff',
    100: '#e0e7ff',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  neutral: {
    0:   '#ffffff',
    50:  '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  accent: {
    cyan:      '#06b6d4',
    cyanLight: '#cffafe',
    coral:     '#f43f5e',
    gold:      '#f59e0b',
    purple:    '#a855f7',
    green:     '#10b981',
  },
  success: '#10b981',
  error:   '#ef4444',
  warning: '#f59e0b',
};

export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const typography = {
  size: {
    xs:   12,
    sm:   14,
    base: 16,
    md:   18,
    lg:   20,
    xl:   24,
    '2xl': 28,
    '3xl': 32,
  },
  weight: {
    normal:   400,
    medium:   500,
    semibold: 600,
    bold:     700,
    extrabold: 800,
  },
};

export const borderRadius = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: '0 1px 4px rgba(0, 0, 0, 0.08)',
  md: '0 4px 12px rgba(0, 0, 0, 0.12)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.15)',
};