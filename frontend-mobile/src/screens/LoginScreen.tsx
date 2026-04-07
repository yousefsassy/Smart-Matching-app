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
import {
  MailIcon,
  LockIcon,
  GoogleIcon,
  ChevronLeftIcon,
  TawTawMarkIcon,
} from '../components/Icons';
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
    const nextErrors: { email?: string; password?: string } = {};

    const emailError = getEmailError(email);
    const passwordError = getLoginPasswordError(password);

    if (emailError) {
      nextErrors.email = emailError;
    }

    if (passwordError) {
      nextErrors.password = passwordError;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
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
    Alert.alert('Coming Soon', 'Google Sign-In will be available in a future update.', [
      { text: 'OK' },
    ]);
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
      >
        <LinearGradient
          colors={colors.gradients.hero as [string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.base }]}
        >
          <View style={styles.heroGlowLarge} />
          <View style={styles.heroGlowSmall} />

          <View style={styles.heroTopBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronLeftIcon size={20} color={colors.neutral[0]} />
            </TouchableOpacity>

            <View style={styles.brandLockup}>
              <TawTawMarkIcon size={22} />
              <Text style={styles.brandLockupText}>TAWTAW</Text>
            </View>
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Sign in</Text>
            <Text style={styles.heroTitle}>Welcome back.</Text>
            <Text style={styles.heroDeck}>Continue to your account.</Text>
          </View>
        </LinearGradient>

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetEyebrow}>Account</Text>
            <Text style={styles.sheetTitle}>Sign in</Text>
          </View>

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
              title="Enter TawTaw"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <View style={styles.altDivider}>
              <View style={styles.altDividerLine} />
              <Text style={styles.altDividerText}>or access with</Text>
              <View style={styles.altDividerLine} />
            </View>

            <PrimaryButton
              variant="outline"
              title="Continue with Google"
              icon={<GoogleIcon size={20} />}
              onPress={handleGoogleLogin}
            />

            <TouchableOpacity
              style={styles.demoTrigger}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowDemo((prev) => !prev);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.demoTriggerText}>{showDemo ? 'Hide' : 'Show'} demo access</Text>
            </TouchableOpacity>

            {showDemo ? (
              <View style={styles.demoPanel}>
                <Text style={styles.demoPanelTitle}>Demo accounts</Text>
                <Text style={styles.demoRow}>Client: `client@demo.com` / `demo123`</Text>
                <Text style={styles.demoRow}>Provider: `provider@demo.com` / `demo123`</Text>
              </View>
            ) : null}
          </View>

          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
            <Text style={styles.footerText}>New to TawTaw?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} activeOpacity={0.8}>
              <Text style={styles.footerLink}>Create an account</Text>
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
    backgroundColor: colors.primary[900],
  },
  scrollView: {
    flex: 1,
  },
  hero: {
    minHeight: 320,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlowLarge: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(207,152,49,0.12)',
    top: -70,
    right: -120,
  },
  heroGlowSmall: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: 30,
    left: -30,
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  brandLockupText: {
    ...typography.role.eyebrow,
    color: colors.neutral[0],
  },
  heroCopy: {
    maxWidth: 320,
    gap: spacing.sm,
  },
  heroEyebrow: {
    ...typography.role.eyebrow,
    color: colors.accent.amber,
  },
  heroTitle: {
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -1.1,
    color: colors.neutral[0],
    fontWeight: typography.weight.bold,
  },
  heroDeck: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.72)',
  },
  sheet: {
    marginTop: -spacing['2xl'],
    backgroundColor: colors.surface.base,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    ...shadows.xl,
  },
  sheetHeader: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[300],
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetEyebrow: {
    ...typography.role.eyebrow,
    color: colors.primary[500],
    marginBottom: spacing.xs,
  },
  sheetTitle: {
    ...typography.role.sectionTitle,
    color: colors.primary[900],
  },
  form: {
    paddingHorizontal: spacing.xl,
    gap: spacing.base,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    fontSize: typography.size.sm,
    color: colors.primary[600],
    fontWeight: typography.weight.semibold,
  },
  loginButton: {
    marginTop: spacing.xs,
  },
  altDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  altDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  altDividerText: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },
  demoTrigger: {
    marginTop: spacing.sm,
    alignSelf: 'center',
  },
  demoTriggerText: {
    fontSize: typography.size.sm,
    color: colors.primary[600],
    fontWeight: typography.weight.semibold,
  },
  demoPanel: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary[900],
    gap: spacing.sm,
  },
  demoPanelTitle: {
    ...typography.role.eyebrow,
    color: colors.accent.amber,
  },
  demoRow: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.base,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: typography.weight.medium,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  footerText: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },
  footerLink: {
    fontSize: typography.size.base,
    color: colors.primary[700],
    fontWeight: typography.weight.bold,
  },
});
