import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface MetricPillProps {
  value: string;
  label: string;
  tone?: 'dark' | 'light' | 'accent';
}

export default function MetricPill({
  value,
  label,
  tone = 'dark',
}: MetricPillProps) {
  const tones = {
    dark: {
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderColor: 'rgba(255,255,255,0.12)',
      valueColor: colors.neutral[0],
      labelColor: 'rgba(255,255,255,0.62)',
    },
    light: {
      backgroundColor: colors.surface.raised,
      borderColor: 'rgba(9, 20, 37, 0.08)',
      valueColor: colors.primary[900],
      labelColor: colors.neutral[500],
    },
    accent: {
      backgroundColor: colors.accent.amberLight,
      borderColor: 'rgba(214, 157, 47, 0.18)',
      valueColor: colors.primary[900],
      labelColor: colors.neutral[700],
    },
  }[tone];

  return (
    <View style={[styles.root, tones]}>
      <Text style={[styles.value, { color: tones.valueColor }]}>{value}</Text>
      <Text style={[styles.label, { color: tones.labelColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minWidth: 92,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  value: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    letterSpacing: -0.45,
    marginBottom: 1,
  },
  label: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
    fontWeight: typography.weight.semibold,
  },
});
