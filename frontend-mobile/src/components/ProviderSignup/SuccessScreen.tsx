import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../theme';
import PrimaryButton from '../PrimaryButton';
import { CheckIcon, MailIcon } from '../Icons';

interface SuccessScreenProps {
  providerName: string;
  providerEmail: string;
  onBackToLogin: () => void;
}

export default function SuccessScreen({ providerName, providerEmail, onBackToLogin }: SuccessScreenProps) {
  const circleScale = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      // Circle scales in with a bounce
      Animated.spring(circleScale, {
        toValue: 1,
        useNativeDriver: true,
        ...animations.spring.bouncy,
      }),
      // Checkmark pops in
      Animated.spring(checkScale, {
        toValue: 1,
        useNativeDriver: true,
        ...animations.spring.snappy,
      }),
      // Content fades in
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: animations.duration.normal,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: animations.duration.normal,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated checkmark circle */}
      <Animated.View
        style={[
          styles.circleOuter,
          { transform: [{ scale: circleScale }] },
        ]}
      >
        <LinearGradient
          colors={[colors.success, colors.accent.cyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.circleGradient}
        >
          <Animated.View style={{ transform: [{ scale: checkScale }] }}>
            <CheckIcon size={44} color={colors.neutral[0]} />
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Text content */}
      <Animated.View
        style={[
          styles.textContent,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        <Text style={styles.title}>Account Created!</Text>
        <Text style={styles.subtitle}>
          {providerName}'s provider account has been set up successfully.
        </Text>

        {/* Email confirmation mock */}
        <View style={styles.emailCard}>
          <MailIcon size={20} color={colors.primary[500]} />
          <View style={styles.emailTextContainer}>
            <Text style={styles.emailLabel}>Confirmation sent to</Text>
            <Text style={styles.emailValue}>{providerEmail}</Text>
          </View>
        </View>

        <Text style={styles.mockNote}>
          This is a demo — no real account was created.
        </Text>

        <View style={styles.buttonGroup}>
          <PrimaryButton
            title="Back to Login"
            onPress={onBackToLogin}
            variant="primary"
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  circleOuter: {
    marginBottom: spacing.xl,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  circleGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.size.base,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: typography.lineHeight.base,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
  },
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    gap: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  emailTextContainer: {
    flex: 1,
  },
  emailLabel: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
  },
  emailValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary[700],
    marginTop: 2,
  },
  mockNote: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonGroup: {
    width: '100%',
    gap: spacing.md,
  },
});
