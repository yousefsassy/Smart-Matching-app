import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import Input from '../Input';
import { LockIcon, CheckCircleIcon, XCircleIcon } from '../Icons';
import { PASSWORD_CRITERIA, getPasswordStrength } from '../../utils/validation';

interface SecurityData {
  password: string;
  confirmPassword: string;
}

interface SecurityStepProps {
  data: SecurityData;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export default function SecurityStep({ data, errors, onChange }: SecurityStepProps) {
  const strength = getPasswordStrength(data.password, {
    neutral: colors.neutral[200],
    error: colors.error,
    warning: colors.warning,
    caution: colors.accent.gold,
    success: colors.success,
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <LockIcon size={22} color={colors.primary[500]} />
        </View>
        <View>
          <Text style={styles.title}>Create Password</Text>
          <Text style={styles.subtitle}>Secure your provider account</Text>
        </View>
      </View>

      <Input
        label="Password"
        placeholder="Create a strong password"
        value={data.password}
        onChangeText={(text) => onChange('password', text)}
        secureTextEntry
        icon={<LockIcon size={20} color={colors.neutral[400]} />}
        error={errors.password}
        returnKeyType="next"
      />

      {/* Password strength bar */}
      {data.password.length > 0 && (
        <View style={styles.strengthSection}>
          <View style={styles.strengthBar}>
            {[1, 2, 3, 4].map((level) => (
              <View
                key={level}
                style={[
                  styles.strengthSegment,
                  {
                    backgroundColor:
                      level <= strength.level ? strength.color : colors.neutral[100],
                  },
                ]}
              />
            ))}
          </View>
          {strength.label !== '' && (
            <Text style={[styles.strengthLabel, { color: strength.color }]}>
              {strength.label}
            </Text>
          )}
        </View>
      )}

      {/* Criteria checklist */}
      {data.password.length > 0 && (
        <View style={styles.criteriaList}>
          {PASSWORD_CRITERIA.map((criterion, index) => {
            const met = criterion.test(data.password);
            return (
              <View key={index} style={styles.criteriaItem}>
                {met ? (
                  <CheckCircleIcon size={14} color={colors.success} />
                ) : (
                  <XCircleIcon size={14} color={colors.neutral[300]} />
                )}
                <Text
                  style={[
                    styles.criteriaText,
                    met && styles.criteriaTextMet,
                  ]}
                >
                  {criterion.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      <Input
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={data.confirmPassword}
        onChangeText={(text) => onChange('confirmPassword', text)}
        secureTextEntry
        icon={<LockIcon size={20} color={colors.neutral[400]} />}
        error={errors.confirmPassword}
        returnKeyType="done"
      />

      {/* Password match indicator */}
      {data.confirmPassword.length > 0 && (
        <View style={styles.matchContainer}>
          {data.password === data.confirmPassword ? (
            <>
              <CheckCircleIcon size={16} color={colors.success} />
              <Text style={styles.matchText}>Passwords match</Text>
            </>
          ) : (
            <>
              <XCircleIcon size={16} color={colors.error} />
              <Text style={styles.mismatchText}>Passwords don't match</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    marginTop: 2,
  },
  strengthSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
    marginTop: -spacing.sm,
  },
  strengthBar: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.xs,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    marginLeft: spacing.sm,
  },
  criteriaList: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  criteriaText: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
  },
  criteriaTextMet: {
    color: colors.success,
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: -spacing.sm,
  },
  matchText: {
    fontSize: typography.size.xs,
    color: colors.success,
    fontWeight: typography.weight.medium,
  },
  mismatchText: {
    fontSize: typography.size.xs,
    color: colors.error,
    fontWeight: typography.weight.medium,
  },
});
