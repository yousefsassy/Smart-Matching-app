import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  LayoutAnimation,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth, UserRole } from '../context/AuthContext';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import RoleSelector from '../components/RoleSelector';
import Checkbox from '../components/Checkbox';
import { MailIcon, LockIcon, UserIcon, BriefcaseIcon, AIBrainIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons';
import { AuthStackParamList } from '../navigation/AuthStack';

type SignupScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

export default function SignupScreen() {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    businessName?: string;
    terms?: string;
  }>({});
  const emailRef = useRef<TextInput>(null);
  const businessNameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Navigate to stepper when provider role is selected
  const handleRoleChange = (newRole: UserRole) => {
    if (newRole === 'provider') {
      navigation.navigate('ProviderSignup');
      return;
    }
    setRole(newRole);
  };

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [role]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (role === 'provider' && !businessName.trim()) {
      newErrors.businessName = 'Business name is required for providers';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      if (errors.terms) {
        Alert.alert('Terms Required', 'Please agree to the Terms & Conditions to continue.');
      }
      return;
    }

    setLoading(true);
    try {
      await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
        businessName: role === 'provider' ? businessName.trim() : undefined,
      });
    } catch (error) {
      Alert.alert(
        'Signup Failed',
        error instanceof Error ? error.message : 'Could not create account',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[colors.primary[900], colors.primary[700], colors.primary[500]]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.hero}>
            <View style={styles.logoContainer}>
              <AIBrainIcon size={56} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join SmartMatch and discover your perfect connections
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.form}>
              {/* Role Selection */}
              <RoleSelector selectedRole={role} onSelectRole={handleRoleChange} />

              <Input
                label="Full Name"
                placeholder="John Doe"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                }}
                autoCapitalize="words"
                icon={<UserIcon size={20} color={colors.neutral[400]} />}
                error={errors.fullName}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />

              <Input
                ref={emailRef}
                label="Email Address"
                placeholder="your.email@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                icon={<MailIcon size={20} color={colors.neutral[400]} />}
                error={errors.email}
                returnKeyType="next"
                onSubmitEditing={() => {
                  if (role === 'provider') {
                    businessNameRef.current?.focus();
                  } else {
                    passwordRef.current?.focus();
                  }
                }}
              />

              {role === 'provider' && (
                <Input
                  ref={businessNameRef}
                  label="Business Name"
                  placeholder="Your Company Name"
                  value={businessName}
                  onChangeText={(text) => {
                    setBusinessName(text);
                    if (errors.businessName) setErrors({ ...errors, businessName: undefined });
                  }}
                  autoCapitalize="words"
                  icon={<BriefcaseIcon size={20} color={colors.neutral[400]} />}
                  error={errors.businessName}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              )}

              <Input
                ref={passwordRef}
                label="Password"
                placeholder="Create a strong password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                secureTextEntry
                icon={<LockIcon size={20} color={colors.neutral[400]} />}
                error={errors.password}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />

              <Input
                ref={confirmPasswordRef}
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: undefined });
                }}
                secureTextEntry
                icon={<LockIcon size={20} color={colors.neutral[400]} />}
                error={errors.confirmPassword}
                returnKeyType="go"
                onSubmitEditing={handleSignup}
              />

              {confirmPassword.length > 0 && (
                <View style={styles.passwordMatchContainer}>
                  {password === confirmPassword ? (
                    <>
                      <CheckCircleIcon size={16} color={colors.success} />
                      <Text style={styles.passwordMatchText}>Passwords match</Text>
                    </>
                  ) : (
                    <>
                      <XCircleIcon size={16} color={colors.error} />
                      <Text style={styles.passwordMismatchText}>Passwords don't match</Text>
                    </>
                  )}
                </View>
              )}

              {/* Terms & Conditions */}
              <View style={styles.termsContainer}>
                <Checkbox
                  checked={agreeToTerms}
                  onChange={(value) => {
                    setAgreeToTerms(value);
                    if (errors.terms) setErrors({ ...errors, terms: undefined });
                  }}
                />
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>I agree to the </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Terms & Conditions', 'View full terms and conditions here.')
                    }
                  >
                    <Text style={styles.termsLink}>Terms & Conditions</Text>
                  </TouchableOpacity>
                  <Text style={styles.termsText}> and </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Privacy Policy', 'View full privacy policy here.')
                    }
                  >
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <PrimaryButton
                title="Create Account"
                onPress={handleSignup}
                loading={loading}
                style={styles.signupButton}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: spacing['2xl'],
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.size.base,
    color: colors.neutral[100],
    textAlign: 'center',
    opacity: 0.9,
  },
  card: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius['2xl'],
    ...shadows.lg,
    overflow: 'hidden',
  },
  form: {
    padding: spacing.xl,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: spacing.md,
    marginTop: 2,
  },
  termsText: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
    lineHeight: typography.size.sm * 1.5,
  },
  termsLink: {
    fontSize: typography.size.sm,
    color: colors.primary[600],
    fontWeight: typography.weight.medium,
    lineHeight: typography.size.sm * 1.5,
  },
  passwordMatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  passwordMatchText: {
    fontSize: typography.size.xs,
    color: colors.success,
    fontWeight: typography.weight.medium,
  },
  passwordMismatchText: {
    fontSize: typography.size.xs,
    color: colors.error,
    fontWeight: typography.weight.medium,
  },
  signupButton: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  footerText: {
    fontSize: typography.size.base,
    color: colors.neutral[100],
  },
  footerLink: {
    fontSize: typography.size.base,
    color: colors.neutral[0],
    fontWeight: typography.weight.bold,
  },
});
