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
import { ClockIcon, MailIcon } from '../Icons';

interface SuccessScreenProps {
  providerName: string;
  providerEmail: string;
  onBackToLogin: () => void;
}

export default function SuccessScreen({ providerName, providerEmail, onBackToLogin }: SuccessScreenProps) {
  const circleScale = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(circleScale, {
        toValue: 1,
        useNativeDriver: true,
        ...animations.spring.bouncy,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        useNativeDriver: true,
        ...animations.spring.snappy,
      }),
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
      {/* Animated clock circle */}
      <Animated.View
        style={[
          styles.circleOuter,
          { transform: [{ scale: circleScale }] },
        ]}
      >
        <LinearGradient
          colors={colors.gradients.mustard as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.circleGradient}
        >
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <ClockIcon size={44} color={colors.neutral[0]} />
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
        <Text style={styles.title}>Account Created</Text>
        <Text style={styles.subtitle}>
          Your account is pending admin confirmation.{'\n'}You'll be notified once approved.
        </Text>

        {/* Email confirmation */}
        <View style={styles.emailCard}>
          <MailIcon size={20} color={colors.primary[500]} />
          <View style={styles.emailTextContainer}>
            <Text style={styles.emailLabel}>Confirmation sent to</Text>
            <Text style={styles.emailValue}>{providerEmail}</Text>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <PrimaryButton
            title="Return to Login"
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
    shadowColor: colors.accent.mustard,
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
    ...typography.role.heroTitle,
    color: colors.neutral[800],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.role.body,
    color: colors.neutral[500],
    textAlign: 'center',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xl,
  },
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.tint,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    gap: spacing.md,
    width: '100%',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary[100],
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
  buttonGroup: {
    width: '100%',
  },
});
