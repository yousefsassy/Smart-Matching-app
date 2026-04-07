import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
}

export default function ToggleSwitch({
  value,
  onValueChange,
  label,
  disabled,
  activeColor = colors.primary[600],
  inactiveColor = colors.neutral[300],
}: ToggleProps) {
  const translateAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const backgroundAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateAnim, {
        toValue: value ? 1 : 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }),
      Animated.timing(backgroundAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, translateAnim, backgroundAnim]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const translateX = translateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.container}
      disabled={disabled}
    >
      <Animated.View style={[styles.track, { backgroundColor }, disabled && styles.trackDisabled]}>
        <Animated.View
          style={[
            styles.thumb,
            { transform: [{ translateX }] },
            disabled && styles.thumbDisabled,
          ]}
        />
      </Animated.View>
      {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  trackDisabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[0],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbDisabled: {
    backgroundColor: colors.neutral[100],
  },
  label: {
    marginLeft: spacing.md,
    fontSize: typography.size.sm,
    color: colors.neutral[700],
    fontWeight: typography.weight.medium,
  },
  labelDisabled: {
    color: colors.neutral[400],
  },
});
