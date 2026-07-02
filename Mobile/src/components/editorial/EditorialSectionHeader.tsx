import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { ChevronRightIcon } from '../Icons';

interface EditorialSectionHeaderProps {
  eyebrow: string;
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  inverse?: boolean;
}

export default function EditorialSectionHeader({
  eyebrow,
  title,
  actionLabel,
  onActionPress,
  inverse = false,
}: EditorialSectionHeaderProps) {
  const titleColor = inverse ? colors.neutral[0] : colors.neutral[900];
  const eyebrowColor = inverse ? 'rgba(255,255,255,0.58)' : colors.primary[500];
  const actionColor = inverse ? colors.accent.amber : colors.primary[600];

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={[styles.eyebrow, { color: eyebrowColor }]}>{eyebrow}</Text>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      </View>
      {actionLabel && onActionPress ? (
        <TouchableOpacity style={styles.action} onPress={onActionPress} activeOpacity={0.8}>
          <Text style={[styles.actionText, { color: actionColor }]}>{actionLabel}</Text>
          <ChevronRightIcon size={12} color={actionColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    ...typography.role.eyebrow,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.role.sectionTitle,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 3,
  },
  actionText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
});
