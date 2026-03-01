import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { AuthStackParamList } from '../navigation/AuthStack';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require('../../assets/welcome-hero.png')}
      style={styles.root}
      resizeMode="cover"
      fadeDuration={0}
    >
      <StatusBar barStyle="light-content" />

      {/* ── Decorative blobs — tied to palette ────────────────────────────── */}
      <View style={styles.blobTopLeft} />
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      {/* ── Dark gradient overlay for text readability ─────────────────────── */}
      <LinearGradient
        colors={['transparent', 'rgba(5,15,30,0.22)', 'rgba(5,15,30,0.60)', 'rgba(5,15,30,0.88)']}
        locations={[0, 0.3, 0.6, 1.0]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Hero center — app name + subtitle ────────────────────────────── */}
      <View style={styles.heroSection}>
        <Text style={styles.appTitle}>TawTaw</Text>
        <Text style={styles.appSubtitle}>
          Whether you need a service or you offer one,{'\n'}
          TawTaw makes the match instantly.
        </Text>
      </View>

      {/* ── Bottom — buttons ──────────────────────────────────────────────── */}
      <View style={[styles.buttonSection, { paddingBottom: insets.bottom + spacing.xl }]}>
        {/* Primary CTA — Sign up */}
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate('Signup')}
          activeOpacity={0.88}
        >
          <Text style={styles.signupButtonText}>Sign up</Text>
        </TouchableOpacity>

        {/* Secondary CTA — Log in */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050F1E',
  },

  // ── Decorative blobs
  blobTopLeft: {
    position: 'absolute',
    top: -60,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.mustard,
    opacity: 0.17,
  },
  blobTopRight: {
    position: 'absolute',
    top: 50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFFFFF',
    opacity: 0.12,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: 200,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[400],
    opacity: 0.18,
  },

  // ── Hero section (centered)
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  appTitle: {
    fontSize: 72,
    fontFamily: 'Beckan',
    color: colors.neutral[0],
    letterSpacing: -1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  appSubtitle: {
    fontFamily: 'SilverGarden',
    fontSize: typography.size.base,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: typography.lineHeight.base,
    textAlign: 'center',
  },

  // ── Button section (bottom)
  buttonSection: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  signupButton: {
    height: 56,
    backgroundColor: colors.accent.mustard,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  signupButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    letterSpacing: typography.letterSpacing.wide,
  },
  loginButton: {
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.38)',
  },
  loginButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    letterSpacing: typography.letterSpacing.wide,
  },
});
