import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, borderRadius, shadows } from '../theme';

const SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
} as const;

const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 20,
  xl: 34,
} as const;

interface AvatarProps {
  name: string;
  size?: keyof typeof SIZES;
  role?: 'client' | 'provider';
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  style?: ViewStyle;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] || '?').toUpperCase();
}

export default function Avatar({
  name,
  size = 'md',
  role = 'client',
  showOnlineStatus = false,
  isOnline = false,
  style,
}: AvatarProps) {
  const dimension = SIZES[size];
  const fontSize = FONT_SIZES[size];
  const initials = getInitials(name);
  const gradientColors: [string, string] = role === 'provider'
    ? [colors.accent.cyan, colors.primary[700]]
    : [colors.primary[500], colors.primary[800]];

  const dotSize = Math.max(8, dimension * 0.22);

  return (
    <View style={[{ width: dimension, height: dimension }, style]}>
      <LinearGradient
        colors={gradientColors}
        style={[
          styles.container,
          { width: dimension, height: dimension, borderRadius: dimension / 2 },
        ]}
      >
        <Text
          style={[
            styles.initials,
            { fontSize, lineHeight: fontSize * 1.2 },
          ]}
        >
          {initials}
        </Text>
      </LinearGradient>
      {showOnlineStatus && (
        <View
          style={[
            styles.statusDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              borderWidth: dotSize > 10 ? 2 : 1.5,
              backgroundColor: isOnline ? colors.success : colors.neutral[400],
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    ...shadows.sm,
  },
  initials: {
    color: colors.neutral[0],
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: colors.neutral[0],
  },
});
