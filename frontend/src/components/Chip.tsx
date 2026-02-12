import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors, typography, spacing, borderRadius, borderWidth as bw } from '../theme';
import { XIcon } from './Icons';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'primary' | 'accent';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export default function Chip({
  label,
  selected = false,
  onPress,
  onRemove,
  variant = 'default',
  size = 'md',
  icon,
  disabled = false,
}: ChipProps) {
  const accentMode = variant === 'accent';
  const selectedBg = accentMode ? colors.accent.cyanLight : colors.primary[50];
  const selectedBorder = accentMode ? colors.accent.cyan : colors.primary[600];
  const selectedText = accentMode ? colors.accent.cyan : colors.primary[700];

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        size === 'sm' && styles.chipSm,
        selected && { backgroundColor: selectedBg, borderColor: selectedBorder },
        disabled && styles.chipDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled || (!onPress && !onRemove)}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.label,
          size === 'sm' && styles.labelSm,
          selected && { color: selectedText, fontWeight: typography.weight.semibold },
          disabled && styles.labelDisabled,
        ]}
      >
        {label}
      </Text>
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          style={styles.removeBtn}
        >
          <XIcon size={14} color={selected ? selectedText : colors.neutral[500]} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[0],
    borderWidth: bw.default,
    borderColor: colors.neutral[200],
    gap: spacing.xs,
  },
  chipSm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[600],
  },
  labelSm: {
    fontSize: typography.size.xs,
  },
  labelDisabled: {
    color: colors.neutral[400],
  },
  iconContainer: {
    marginRight: 2,
  },
  removeBtn: {
    marginLeft: 2,
  },
});
