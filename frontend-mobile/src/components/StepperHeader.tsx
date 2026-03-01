import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  LayoutAnimation,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../theme';
import { CheckIcon } from './Icons';

interface StepperHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function StepperHeader({ currentStep, totalSteps, stepLabels }: StepperHeaderProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / totalSteps,
      duration: animations.duration.slow,
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps, progressAnim]);

  // Pulse animation for active dot
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Step label */}
      <Text style={styles.stepLabel}>
        STEP {currentStep + 1} OF {totalSteps}
      </Text>
      <Text style={styles.stepTitle}>{stepLabels[currentStep]}</Text>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFillContainer, { width: progressWidth }]}>
          <LinearGradient
            colors={colors.gradients.accent as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressFill}
          />
        </Animated.View>
      </View>

      {/* Step dots */}
      <View style={styles.dotsContainer}>
        {stepLabels.map((label, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <View key={index} style={styles.dotWrapper}>
              <Animated.View
                style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isActive && styles.dotActive,
                  !isCompleted && !isActive && styles.dotUpcoming,
                  isActive && { transform: [{ scale: pulseAnim }] },
                ]}
              >
                {isCompleted ? (
                  <CheckIcon size={14} color={colors.neutral[0]} />
                ) : (
                  <Text
                    style={[
                      styles.dotNumber,
                      isActive && styles.dotNumberActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </Animated.View>
              <Text
                style={[
                  styles.dotLabel,
                  isCompleted && styles.dotLabelCompleted,
                  isActive && styles.dotLabelActive,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  stepLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.primary[500],
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.xs,
  },
  stepTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.base,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressFillContainer: {
    height: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    flex: 1,
    borderRadius: borderRadius.full,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dotWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dotCompleted: {
    backgroundColor: colors.primary[500],
  },
  dotActive: {
    backgroundColor: colors.primary[500],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  dotUpcoming: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.neutral[300],
  },
  dotNumber: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[400],
  },
  dotNumberActive: {
    color: colors.neutral[0],
  },
  dotLabel: {
    fontSize: 10,
    fontWeight: typography.weight.medium,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  dotLabelCompleted: {
    color: colors.primary[500],
  },
  dotLabelActive: {
    color: colors.primary[600],
    fontWeight: typography.weight.semibold,
  },
});
