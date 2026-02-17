import React, { useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { ChevronRightIcon } from './Icons';

interface CardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
  variant?: 'default' | 'gradient' | 'outlined';
  gradientColors?: string[];
  badge?: string | number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export default function Card({
  title,
  subtitle,
  icon,
  onPress,
  showArrow = true,
  variant = 'default',
  gradientColors,
  badge,
  style,
  children,
}: CardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const content = (
    <>
      <View style={styles.contentRow}>
        {icon && (
          <View
            style={[
              styles.iconContainer,
              variant === 'gradient' && styles.iconContainerGradient,
            ]}
          >
            {icon}
          </View>
        )}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                variant === 'gradient' && styles.titleGradient,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {badge !== undefined && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                variant === 'gradient' && styles.subtitleGradient,
              ]}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {showArrow && onPress && (
          <ChevronRightIcon
            size={20}
            color={variant === 'gradient' ? colors.neutral[0] : colors.neutral[400]}
          />
        )}
      </View>
      {children}
    </>
  );

  if (variant === 'gradient') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          disabled={!onPress}
        >
          <LinearGradient
            colors={(gradientColors || [colors.primary[500], colors.primary[700]]) as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, styles.gradientCard]}
          >
            {content}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={!onPress}
        style={[
          styles.card,
          variant === 'outlined' && styles.outlinedCard,
        ]}
      >
        {content}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    ...shadows.sm,
  },
  gradientCard: {
    ...shadows.md,
  },
  outlinedCard: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    ...shadows.none,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainerGradient: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
  },
  titleGradient: {
    color: colors.neutral[0],
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    marginTop: 2,
  },
  subtitleGradient: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  badge: {
    backgroundColor: colors.accent.coral,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
});