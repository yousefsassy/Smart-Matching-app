import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TextInputProps,
} from 'react-native';
import { colors, typography, spacing, borderRadius, borderWidth as bw } from '../theme';

interface TextareaProps extends Omit<TextInputProps, 'style' | 'multiline'> {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;
  minHeight?: number;
  maxHeight?: number;
  error?: string;
  disabled?: boolean;
}

export default function Textarea({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength,
  showCharCount = false,
  minHeight = 100,
  maxHeight,
  error,
  disabled = false,
  ...props
}: TextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? colors.error : colors.neutral[200],
      error ? colors.error : colors.primary[500],
    ],
  });

  const backgroundColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.neutral[0], colors.neutral[0]],
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor, backgroundColor },
          error && styles.inputError,
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            { minHeight },
            maxHeight ? { maxHeight } : undefined,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[400]}
          multiline
          textAlignVertical="top"
          maxLength={maxLength}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {showCharCount && maxLength && (
          <Text style={styles.charCount}>
            {value.length}/{maxLength}
          </Text>
        )}
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  inputContainer: {
    borderWidth: bw.default,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: colors.error,
  },
  textInput: {
    fontSize: typography.size.base,
    color: colors.neutral[800],
    padding: spacing.base,
    lineHeight: typography.lineHeight.base,
  },
  charCount: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    textAlign: 'right',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  error: {
    fontSize: typography.size.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
