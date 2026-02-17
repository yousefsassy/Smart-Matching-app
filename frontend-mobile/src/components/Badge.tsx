import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, borderRadius } from '../theme';

interface BadgeProps {
  content?: string | number;
  variant?: 'notification' | 'label' | 'dot';
  color?: string;
  textColor?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export default function Badge({
  content,
  variant = 'notification',
  color = colors.accent.coral,
  textColor = colors.neutral[0],
  size = 'sm',
  style,
}: BadgeProps) {
  if (variant === 'dot') {
    const dotSize = size === 'sm' ? 8 : 10;
    return (
      <View
        style={[
          styles.dot,
          { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color },
          style,
        ]}
      />
    );
  }

  if (variant === 'label') {
    return (
      <View style={[styles.label, { backgroundColor: color }, style]}>
        <Text style={[styles.labelText, { color: textColor }, size === 'md' && styles.labelTextMd]}>
          {content}
        </Text>
      </View>
    );
  }

  // notification variant
  const minSize = size === 'sm' ? 18 : 22;
  return (
    <View
      style={[
        styles.notification,
        { minWidth: minSize, height: minSize, borderRadius: minSize / 2, backgroundColor: color },
        style,
      ]}
    >
      <Text style={[styles.notificationText, size === 'md' && styles.notificationTextMd, { color: textColor }]}>
        {content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    borderWidth: 1.5,
    borderColor: colors.neutral[0],
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.md,
  },
  labelText: {
    fontSize: 9,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelTextMd: {
    fontSize: typography.size.xs,
  },
  notification: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
  },
  notificationTextMd: {
    fontSize: typography.size.xs,
  },
});
