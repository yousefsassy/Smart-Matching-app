import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface StatWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'gradient' | 'compact';
  gradientColors?: string[];
}

export default function StatWidget({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  gradientColors,
}: StatWidgetProps) {
  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={(gradientColors || [colors.accent.cyan, colors.primary[500]]) as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.widget, styles.gradientWidget]}
      >
        <View style={styles.header}>
          {icon && <View style={styles.iconGradient}>{icon}</View>}
          {trend && (
            <View
              style={[
                styles.trendBadge,
                { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
              ]}
            >
              <Text style={[styles.trendText, { color: colors.neutral[0] }]}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.value, styles.valueGradient]}>{value}</Text>
        <Text style={[styles.title, styles.titleGradient]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, styles.subtitleGradient]}>{subtitle}</Text>}
      </LinearGradient>
    );
  }

  if (variant === 'compact') {
    return (
      <View style={[styles.widget, styles.compactWidget]}>
        <View style={styles.compactRow}>
          {icon && <View style={styles.iconCompact}>{icon}</View>}
          <View style={styles.compactContent}>
            <Text style={styles.compactTitle}>{title}</Text>
            <Text style={styles.compactValue}>{value}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.widget}>
      <View style={styles.header}>
        {icon && <View style={styles.icon}>{icon}</View>}
        {trend && (
          <View
            style={[
              styles.trendBadge,
              trend.isPositive ? styles.trendPositive : styles.trendNegative,
            ]}
          >
            <Text
              style={[
                styles.trendText,
                { color: trend.isPositive ? colors.success : colors.error },
              ]}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  widget: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    ...shadows.sm,
  },
  gradientWidget: {
    ...shadows.md,
  },
  compactWidget: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGradient: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCompact: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  value: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  valueGradient: {
    color: colors.neutral[0],
  },
  title: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[600],
  },
  titleGradient: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  subtitle: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    marginTop: 2,
  },
  subtitleGradient: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  trendBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  trendPositive: {
    backgroundColor: colors.accent.cyanLight,
  },
  trendNegative: {
    backgroundColor: '#FEE2E2',
  },
  trendText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    marginBottom: 2,
  },
  compactValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
  },
});