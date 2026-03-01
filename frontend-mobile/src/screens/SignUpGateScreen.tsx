import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../theme';
import { AuthStackParamList } from '../navigation/AuthStack';
import { ChevronLeftIcon, ChevronRightIcon, UserIcon, BriefcaseIcon } from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

export default function SignUpGateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const clientScale = useRef(new Animated.Value(1)).current;
  const providerScale = useRef(new Animated.Value(1)).current;

  const pressIn = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 0.97,
      useNativeDriver: true,
      ...animations.spring.snappy,
    }).start();
  };

  const pressOut = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      ...animations.spring.snappy,
    }).start();
  };

  return (
    <ImageBackground
      source={require('../../assets/welcome-hero.png')}
      style={styles.root}
      resizeMode="cover"
      fadeDuration={0}
    >
      <StatusBar barStyle="light-content" />

      {/* Decorative blobs */}
      <View style={styles.blobTopLeft} />
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      {/* Dark gradient overlay */}
      <LinearGradient
        colors={['rgba(5,15,30,0.55)', 'rgba(5,15,30,0.80)', 'rgba(5,15,30,0.92)']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Back button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + spacing.md }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <ChevronLeftIcon size={22} color={colors.neutral[0]} />
      </TouchableOpacity>

      {/* Main content */}
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 72, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Join TawTaw</Text>
          <Text style={styles.subtitle}>How would you like to sign up?</Text>
        </View>

        {/* Cards */}
        <View style={styles.cards}>
          {/* Client card */}
          <Animated.View style={{ transform: [{ scale: clientScale }] }}>
            <TouchableOpacity
              style={styles.card}
              activeOpacity={1}
              onPressIn={() => pressIn(clientScale)}
              onPressOut={() => pressOut(clientScale)}
              onPress={() => navigation.navigate('ClientSignup')}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.accent.mustard }]}>
                <UserIcon size={26} color={colors.neutral[900]} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Client</Text>
                <Text style={styles.cardSubtitle}>I need a service</Text>
              </View>
              <ChevronRightIcon size={20} color="rgba(255,255,255,0.55)" />
            </TouchableOpacity>
          </Animated.View>

          {/* OR separator */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          {/* Provider card */}
          <Animated.View style={{ transform: [{ scale: providerScale }] }}>
            <TouchableOpacity
              style={styles.card}
              activeOpacity={1}
              onPressIn={() => pressIn(providerScale)}
              onPressOut={() => pressOut(providerScale)}
              onPress={() => navigation.navigate('ProviderSignup')}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.primary[600] }]}>
                <BriefcaseIcon size={26} color={colors.neutral[0]} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Provider</Text>
                <Text style={styles.cardSubtitle}>I offer services</Text>
              </View>
              <ChevronRightIcon size={20} color="rgba(255,255,255,0.55)" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050F1E',
  },
  blobTopLeft: {
    position: 'absolute',
    top: -60,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.mustard,
    opacity: 0.12,
  },
  blobTopRight: {
    position: 'absolute',
    top: 50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFFFFF',
    opacity: 0.08,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: 200,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[400],
    opacity: 0.15,
  },
  backButton: {
    position: 'absolute',
    left: spacing.xl,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: typography.size.base,
    color: 'rgba(255,255,255,0.68)',
    textAlign: 'center',
  },
  cards: {
    justifyContent: 'center',
    gap: spacing.base,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    gap: spacing.base,
    ...shadows.md,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.62)',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  orText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: 'rgba(255,255,255,0.42)',
    letterSpacing: typography.letterSpacing.widest,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.size.base,
    color: 'rgba(255,255,255,0.58)',
  },
  footerLink: {
    fontSize: typography.size.base,
    color: colors.accent.mustard,
    fontWeight: typography.weight.bold,
  },
});
