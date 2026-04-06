import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/AuthStack';
import PrimaryButton from '../components/PrimaryButton';
import Input from '../components/Input';
import { UserIcon, MailIcon, LockIcon, CheckCircleIcon, XCircleIcon, ChevronLeftIcon } from '../components/Icons';
import {
  PASSWORD_CRITERIA,
  getConfirmPasswordError,
  getEmailError,
  getFullNameError,
  getPasswordStrength,
  getSignupPasswordError,
} from '../utils/validation';

type ClientSignupNav = NativeStackNavigationProp<AuthStackParamList, 'ClientSignup'>;

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function ClientSignupScreen() {
  const navigation = useNavigation<ClientSignupNav>();
  const { signup } = useAuth();
  const insets = useSafeAreaInsets();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors],
  );

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    const fullNameError = getFullNameError(formData.fullName);
    const emailError = getEmailError(formData.email);
    const passwordError = getSignupPasswordError(formData.password);
    const confirmPasswordError = getConfirmPasswordError(
      formData.password,
      formData.confirmPassword
    );

    if (fullNameError) errs.fullName = fullNameError;
    if (emailError) errs.email = emailError;
    if (passwordError) errs.password = passwordError;
    if (confirmPasswordError) errs.confirmPassword = confirmPasswordError;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'client',
      });
      // signup() sets isAuthenticated=true → RootNavigator switches to MainTabs automatically
    } catch {
      setIsSubmitting(false);
    }
  };

  const strength = getPasswordStrength(formData.password, {
    neutral: colors.neutral[200],
    error: colors.error,
    warning: colors.warning,
    caution: colors.accent.gold,
    success: colors.success,
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Page title */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Create Account</Text>
            <Text style={styles.pageSubtitle}>Sign up to get started with TawTaw</Text>
          </View>

          {/* Single form card */}
          <View style={styles.card}>
            {/* Personal Info section */}
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <UserIcon size={20} color={colors.primary[500]} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <Text style={styles.sectionSubtitle}>Tell us about yourself</Text>
              </View>
            </View>

            <Input
              label="Full Name"
              placeholder="John Doe"
              value={formData.fullName}
              onChangeText={(text) => handleFieldChange('fullName', text)}
              autoCapitalize="words"
              icon={<UserIcon size={20} color={colors.neutral[400]} />}
              error={errors.fullName}
              returnKeyType="next"
            />

            <Input
              label="Email Address"
              placeholder="your.email@example.com"
              value={formData.email}
              onChangeText={(text) => handleFieldChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              icon={<MailIcon size={20} color={colors.neutral[400]} />}
              error={errors.email}
              returnKeyType="next"
            />

            {/* Password section divider */}
            <View style={styles.divider} />
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <LockIcon size={20} color={colors.primary[500]} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Create Password</Text>
                <Text style={styles.sectionSubtitle}>Secure your account</Text>
              </View>
            </View>

            <Input
              label="Password"
              placeholder="Create a strong password"
              value={formData.password}
              onChangeText={(text) => handleFieldChange('password', text)}
              secureTextEntry
              icon={<LockIcon size={20} color={colors.neutral[400]} />}
              error={errors.password}
              returnKeyType="next"
            />

            {/* Password strength bar */}
            {formData.password.length > 0 && (
              <View style={styles.strengthSection}>
                <View style={styles.strengthBar}>
                  {[1, 2, 3, 4].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthSegment,
                        { backgroundColor: level <= strength.level ? strength.color : colors.neutral[100] },
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
            {formData.password.length > 0 && (
              <View style={styles.criteriaList}>
                {PASSWORD_CRITERIA.map((criterion, index) => {
                  const met = criterion.test(formData.password);
                  return (
                    <View key={index} style={styles.criteriaItem}>
                      {met ? (
                        <CheckCircleIcon size={14} color={colors.success} />
                      ) : (
                        <XCircleIcon size={14} color={colors.neutral[300]} />
                      )}
                      <Text style={[styles.criteriaText, met && styles.criteriaTextMet]}>
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
              value={formData.confirmPassword}
              onChangeText={(text) => handleFieldChange('confirmPassword', text)}
              secureTextEntry
              icon={<LockIcon size={20} color={colors.neutral[400]} />}
              error={errors.confirmPassword}
              returnKeyType="done"
            />

            {/* Password match indicator */}
            {formData.confirmPassword.length > 0 && (
              <View style={styles.matchContainer}>
                {formData.password === formData.confirmPassword ? (
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

          {/* Action buttons */}
          <View style={styles.navButtons}>
            <PrimaryButton
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              fullWidth={false}
              style={styles.backButton}
              icon={<ChevronLeftIcon size={18} color={colors.primary[600]} />}
            />
            <PrimaryButton
              title="Create Account"
              onPress={handleSubmit}
              variant="primary"
              loading={isSubmitting}
              fullWidth={false}
              style={styles.nextButton}
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  pageHeader: {
    marginBottom: spacing.xl,
  },
  pageTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  sectionSubtitle: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginVertical: spacing.lg,
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
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1.5,
  },
});
