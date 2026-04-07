import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = true,
}: PrimaryButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const sizeStyles = {
    sm: { paddingVertical: spacing.sm + 1, paddingHorizontal: spacing.base },
    md: { paddingVertical: spacing.md + 3, paddingHorizontal: spacing.xl },
    lg: { paddingVertical: spacing.base + 4, paddingHorizontal: spacing['2xl'] },
  };

  const textSizeStyles = {
    sm: { fontSize: typography.size.sm, letterSpacing: 0.1 },
    md: { fontSize: typography.size.base, letterSpacing: 0.15 },
    lg: { fontSize: typography.size.md, letterSpacing: 0.2 },
  };

  const isDisabled = disabled || loading;

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.neutral[900] : colors.primary[600]}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={[
              styles.text,
              textSizeStyles[size],
              variant === 'primary' ? styles.textPrimary : null,
              variant === 'secondary' ? styles.textSecondary : null,
              variant === 'outline' ? styles.textOutline : null,
              variant === 'ghost' ? styles.textGhost : null,
              icon && iconPosition === 'left' ? { marginLeft: spacing.sm } : null,
              icon && iconPosition === 'right' ? { marginRight: spacing.sm } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }] },
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          activeOpacity={0.9}
          style={styles.touchable}
        >
          <LinearGradient
            colors={
              isDisabled
                ? [colors.neutral[300], colors.neutral[400]]
                : (colors.gradients.mustard as [string, string])
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.button,
              sizeStyles[size],
              styles.primaryButton,
              isDisabled && styles.disabled,
            ]}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          sizeStyles[size],
          variant === 'secondary' && styles.secondaryButton,
          variant === 'outline' && styles.outlineButton,
          variant === 'ghost' && styles.ghostButton,
          isDisabled && styles.disabled,
        ]}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  touchable: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius['2xl'],
    minHeight: 56,
  },
  primaryButton: {
    borderRadius: borderRadius['2xl'],
    ...shadows.mustard,
  },
  secondaryButton: {
    backgroundColor: colors.primary[900],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius['2xl'],
  },
  outlineButton: {
    backgroundColor: colors.surface.raised,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius['2xl'],
  },
  ghostButton: {
    backgroundColor: colors.surface.muted,
    borderRadius: borderRadius['2xl'],
  },
  disabled: {
    opacity: 0.58,
  },
  text: {
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  textPrimary: {
    color: colors.neutral[900],
  },
  textSecondary: {
    color: colors.neutral[0],
  },
  textOutline: {
    color: colors.primary[700],
  },
  textGhost: {
    color: colors.primary[700],
  },
});
