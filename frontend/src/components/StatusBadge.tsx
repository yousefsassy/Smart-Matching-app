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
    <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
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
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
  },
  labelMd: {
    fontSize: typography.size.sm,
  },
});
