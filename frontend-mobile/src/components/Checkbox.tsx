import React, { useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { CheckIcon } from './Icons';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string | React.ReactNode;
  error?: boolean;
}

export default function Checkbox({ checked, onChange, label, error }: CheckboxProps) {
  const scaleAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;

  const handlePress = () => {
    const newValue = !checked;
    
    Animated.spring(scaleAnim, {
      toValue: newValue ? 1 : 0,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
    
    onChange(newValue);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
          error && styles.checkboxError,
        ]}
      >
        <Animated.View
          style={[
            styles.checkmark,
            {
              transform: [{ scale: scaleAnim }],
              opacity: scaleAnim,
            },
          ]}
        >
          <CheckIcon size={14} color={colors.neutral[0]} />
        </Animated.View>
      </View>
      {label && (
        <View style={styles.labelContainer}>
          {typeof label === 'string' ? (
            <Text style={styles.label}>{label}</Text>
          ) : (
            label
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkboxError: {
    borderColor: colors.error,
  },
  checkmark: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  label: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
});