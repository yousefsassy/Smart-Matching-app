import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import { MailIcon, LockIcon, AIBrainIcon, GoogleIcon } from '../components/Icons';
import { AuthStackParamList } from '../navigation/AuthStack';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

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
              <AIBrainIcon size={64} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your SmartMatch journey
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
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
                icon={<MailIcon size={20} color={colors.neutral[400]} />}
                error={errors.email}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                secureTextEntry
                icon={<LockIcon size={20} color={colors.neutral[400]} />}
                error={errors.password}
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
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <GoogleIcon size={20} />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </TouchableOpacity>

              {/* Demo Credentials */}
              <View style={styles.demoSection}>
                <Text style={styles.demoTitle}>Demo Accounts:</Text>
                <Text style={styles.demoText}>Client: client@demo.com / demo123</Text>
                <Text style={styles.demoText}>Provider: provider@demo.com / demo123</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Sign Up</Text>
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
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    marginBottom: spacing.lg,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: typography.size.sm,
    color: colors.primary[600],
    fontWeight: typography.weight.medium,
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  dividerText: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    marginHorizontal: spacing.md,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  googleButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.neutral[700],
    marginLeft: spacing.md,
  },
  demoSection: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    padding: spacing.base,
    marginTop: spacing.sm,
  },
  demoTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary[700],
    marginBottom: spacing.xs,
  },
  demoText: {
    fontSize: typography.size.xs,
    color: colors.primary[600],
    marginBottom: 2,
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
