import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { ServiceRequestStatus } from '../types/serviceRequest';
import { STATUS_CONFIG } from '../constants/statusConfig';

interface StatusBadgeProps {
  status: ServiceRequestStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          borderColor: `${config.color}22`,
          paddingVertical: size === 'sm' ? 5 : 7,
          paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
        },
      ]}
    >
      {config.icon(iconSize)}
      <Text style={[styles.label, { color: config.color }, size === 'md' && styles.labelMd]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.2,
  },
  labelMd: {
    fontSize: typography.size.sm,
  },
});
