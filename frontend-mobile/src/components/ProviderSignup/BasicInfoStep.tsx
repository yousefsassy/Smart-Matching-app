import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import Input from '../Input';
import { UserIcon, MailIcon } from '../Icons';

interface BasicInfoData {
  fullName: string;
  email: string;
}

interface BasicInfoStepProps {
  data: BasicInfoData;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export default function BasicInfoStep({ data, errors, onChange }: BasicInfoStepProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <UserIcon size={22} color={colors.primary[500]} />
        </View>
        <View>
          <Text style={styles.title}>Personal Information</Text>
          <Text style={styles.subtitle}>Tell us about yourself</Text>
        </View>
      </View>

      <Input
        label="Full Name"
        placeholder="John Doe"
        value={data.fullName}
        onChangeText={(text) => onChange('fullName', text)}
        autoCapitalize="words"
        icon={<UserIcon size={20} color={colors.neutral[400]} />}
        error={errors.fullName}
        returnKeyType="next"
      />

      <Input
        label="Email Address"
        placeholder="your.email@example.com"
        value={data.email}
        onChangeText={(text) => onChange('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        icon={<MailIcon size={20} color={colors.neutral[400]} />}
        error={errors.email}
        returnKeyType="done"
      />

      <Text style={styles.hint}>
        We'll use this email to verify your account and send important updates.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.base,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.card,
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
    backgroundColor: colors.surface.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  title: {
    ...typography.role.cardTitle,
    color: colors.neutral[800],
  },
  subtitle: {
    ...typography.role.meta,
    color: colors.neutral[500],
    marginTop: 2,
  },
  hint: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    lineHeight: typography.lineHeight.xs * 1.2,
    marginTop: spacing.xs,
  },
});
