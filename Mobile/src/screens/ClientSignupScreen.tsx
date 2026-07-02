import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/AuthStack';
import PrimaryButton from '../components/PrimaryButton';
import Input from '../components/Input';
import { UserIcon, MailIcon, LockIcon, CheckCircleIcon, XCircleIcon, ChevronLeftIcon, TawTawMarkIcon } from '../components/Icons';
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
    } catch (error) {
      Alert.alert(
        'Registration failed',
        error instanceof Error ? error.message : 'Could not create your account right now.'
      );
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
      <StatusBar barStyle="light-content" />
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={colors.gradients.header as [string, string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <TouchableOpacity style={styles.heroBack} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <ChevronLeftIcon size={18} color={colors.neutral[0]} />
            </TouchableOpacity>
            <View style={styles.heroMark}>
              <TawTawMarkIcon size={34} />
            </View>
            <Text style={styles.pageTitle}>Create your account</Text>
          </LinearGradient>

          {/* Single form card */}
          <View style={styles.card}>
            {/* Personal Info section */}
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <UserIcon size={20} color={colors.primary[500]} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <Text style={styles.sectionSubtitle}>Your details</Text>
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

            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <LockIcon size={20} color={colors.primary[500]} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Create Password</Text>
                <Text style={styles.sectionSubtitle}>Secure access</Text>
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
              icon={<ChevronLeftIcon size={18} color={colors.primary[700]} />}
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  hero: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  heroBack: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay.glassSoft,
    borderWidth: 1,
    borderColor: colors.overlay.border,
    marginBottom: spacing.md,
  },
  heroMark: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pageTitle: {
    fontSize: typography.size['2xl'],
    lineHeight: typography.lineHeight['2xl'],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.7,
    color: colors.neutral[0],
  },
  card: {
    backgroundColor: colors.surface.base,
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  sectionTitle: {
    ...typography.role.cardTitle,
    color: colors.neutral[800],
  },
  sectionSubtitle: {
    ...typography.role.meta,
    color: colors.neutral[500],
    marginTop: 2,
  },
  strengthSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
    marginTop: -spacing.xs,
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
    marginBottom: spacing.md,
    gap: spacing.xs,
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
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1.5,
  },
});
