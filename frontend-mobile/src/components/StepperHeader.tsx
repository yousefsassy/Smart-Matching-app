import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../theme';

interface StepperHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  caption?: string;
}

export default function StepperHeader({
  currentStep,
  totalSteps,
  stepLabels,
  caption = 'Request details',
}: StepperHeaderProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / totalSteps,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.meta}>
            {currentStep + 1}/{totalSteps}
          </Text>
          <Text style={styles.title}>{stepLabels[currentStep]}</Text>
        </View>
        <Text style={styles.caption}>{caption}</Text>
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.fillContainer, { width: progressWidth }]}>
          <LinearGradient
            colors={colors.gradients.mustard as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>
      </View>

      <View style={styles.labelsRow}>
        {stepLabels.map((label, index) => {
          const active = index === currentStep;
          const complete = index < currentStep;

          return (
            <View key={label} style={styles.labelBlock}>
              <View
                style={[
                  styles.labelDot,
                  active && styles.labelDotActive,
                  complete && styles.labelDotComplete,
                ]}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.labelText,
                  active && styles.labelTextActive,
                  complete && styles.labelTextComplete,
                ]}
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
    backgroundColor: colors.surface.raised,
    borderRadius: 26,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    marginBottom: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.md,
    marginBottom: spacing.base,
  },
  meta: {
    ...typography.role.eyebrow,
    color: colors.primary[500],
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.role.sectionTitle,
    color: colors.primary[900],
  },
  caption: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    fontWeight: typography.weight.medium,
  },
  track: {
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    overflow: 'hidden',
    marginBottom: spacing.base,
  },
  fillContainer: {
    height: '100%',
    overflow: 'hidden',
    borderRadius: borderRadius.full,
  },
  fill: {
    flex: 1,
  },
  labelsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  labelBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral[300],
  },
  labelDotActive: {
    width: 18,
    backgroundColor: colors.accent.amber,
  },
  labelDotComplete: {
    backgroundColor: colors.primary[500],
  },
  labelText: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    fontWeight: typography.weight.medium,
  },
  labelTextActive: {
    color: colors.neutral[700],
    fontWeight: typography.weight.semibold,
  },
  labelTextComplete: {
    color: colors.primary[500],
  },
});
