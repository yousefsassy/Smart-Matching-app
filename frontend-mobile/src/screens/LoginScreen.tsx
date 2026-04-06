import React, { useState, useRef } from 'react';
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
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import { MailIcon, LockIcon, GoogleIcon, ChevronLeftIcon } from '../components/Icons';
import { AuthStackParamList } from '../navigation/AuthStack';
import { getEmailError, getLoginPasswordError } from '../utils/validation';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const passwordRef = useRef<TextInput>(null);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    const emailError = getEmailError(email);
    const passwordError = getLoginPasswordError(password);

    if (emailError) {
      newErrors.email = emailError;
    }

    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'Invalid email or password',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      'Coming Soon',
      'Google Sign-In will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Gradient Hero Section ────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#0A2744', '#134686', '#1a5699']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}
        >
          {/* Decorative circles */}
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.backButtonInner}>
              <ChevronLeftIcon size={20} color={colors.neutral[0]} />
            </View>
          </TouchableOpacity>

          {/* Logo mark */}
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>T</Text>
          </View>

          {/* Hero text */}
          <Text style={styles.heroTitle}>Welcome back</Text>
          <Text style={styles.heroSubtitle}>Sign in to your TawTaw account</Text>
        </LinearGradient>

        {/* ── Form Card (overlaps gradient) ───────────────────────────────────── */}
        <View style={styles.formCard}>
          <View style={styles.formCardHandle} />

          <View style={styles.form}>
            <Input
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
              icon={<MailIcon size={18} color={colors.neutral[400]} />}
              error={errors.email}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <Input
              ref={passwordRef}
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              secureTextEntry
              icon={<LockIcon size={18} color={colors.neutral[400]} />}
              error={errors.password}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => Alert.alert('Coming Soon', 'Password reset will be available soon.')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <PrimaryButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <PrimaryButton
              variant="outline"
              title="Continue with Google"
              icon={<GoogleIcon size={20} />}
              onPress={handleGoogleLogin}
            />

            {/* Demo Credentials */}
            <TouchableOpacity
              style={styles.demoToggle}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowDemo(!showDemo);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.demoToggleText}>
                {showDemo ? 'Hide' : 'Show'} demo credentials
              </Text>
            </TouchableOpacity>
            {showDemo && (
              <View style={styles.demoSection}>
                <Text style={styles.demoTitle}>Demo Accounts</Text>
                <View style={styles.demoRow}>
                  <View style={styles.demoBadge}>
                    <Text style={styles.demoBadgeText}>CLIENT</Text>
                  </View>
                  <Text style={styles.demoText}>client@demo.com · demo123</Text>
                </View>
                <View style={styles.demoRow}>
                  <View style={[styles.demoBadge, { backgroundColor: colors.accent.cyanLight }]}>
                    <Text style={[styles.demoBadgeText, { color: colors.accent.cyan }]}>
                      PROVIDER
                    </Text>
                  </View>
                  <Text style={styles.demoText}>provider@demo.com · demo123</Text>
                </View>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2744',
  },
  scrollView: {
    flex: 1,
  },

  // ── Hero gradient section
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
    overflow: 'hidden',
    position: 'relative',
    minHeight: 240,
  },
  heroCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(38, 96, 175, 0.3)',
    top: -60,
    right: -40,
  },
  heroCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(254, 178, 26, 0.12)',
    bottom: 20,
    left: -30,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
  },
  backButtonInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.accent.mustard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
    ...shadows.mustard,
  },
  logoText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    letterSpacing: -1,
  },
  heroTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    marginBottom: spacing.xs,
    letterSpacing: typography.letterSpacing.tight,
  },
  heroSubtitle: {
    fontSize: typography.size.base,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: typography.weight.regular,
  },

  // ── Form card
  formCard: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    marginTop: -spacing.xl,
    ...shadows.xl,
  },
  formCardHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[200],
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  form: {
    paddingHorizontal: spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    fontSize: typography.size.sm,
    color: colors.primary[600],
    fontWeight: typography.weight.semibold,
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  dividerText: {
    fontSize: typography.size.sm,
    color: colors.neutral[400],
    marginHorizontal: spacing.md,
  },

  // Demo credentials
  demoToggle: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  demoToggleText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary[500],
    textDecorationLine: 'underline',
  },
  demoSection: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary[100],
    gap: spacing.sm,
  },
  demoTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary[700],
    marginBottom: spacing.xs,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  demoBadge: {
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  demoBadgeText: {
    fontSize: typography.size.xs - 1,
    fontWeight: typography.weight.bold,
    color: colors.primary[700],
    letterSpacing: typography.letterSpacing.wider,
  },
  demoText: {
    fontSize: typography.size.xs,
    color: colors.primary[600],
    flex: 1,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  footerText: {
    fontSize: typography.size.base,
    color: colors.neutral[500],
  },
  footerLink: {
    fontSize: typography.size.base,
    color: colors.primary[600],
    fontWeight: typography.weight.bold,
  },
});
