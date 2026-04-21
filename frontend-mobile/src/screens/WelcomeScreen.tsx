import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { AuthStackParamList } from '../navigation/AuthStack';
import { TawTawMarkIcon } from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={require('../../assets/welcome-hero.png')}
        style={styles.heroBackground}
        resizeMode="cover"
        fadeDuration={0}
      >
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(5,11,19,0.18)', 'rgba(5,11,19,0.52)', 'rgba(5,11,19,0.92)']}
          locations={[0, 0.44, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </ImageBackground>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.header}>
          <View style={styles.brandChip}>
            <TawTawMarkIcon size={24} />
            <Text style={styles.brandChipText}>TAWTAW</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Trusted local services</Text>
          <Text style={styles.heroTitle}>AI-powered smart matching for clients and service providers.</Text>
          <Text style={styles.heroSubtitle}>
            Request. Review. Move forward.
          </Text>
        </View>

        <View style={styles.ctaBlock}>
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={() => navigation.navigate('Signup')}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={colors.gradients.mustard as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryCtaGradient}
            >
              <Text style={styles.primaryCtaText}>Create an account</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryCta}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.82}
          >
            <Text style={styles.secondaryCtaText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary[900],
  },
  heroBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: spacing['3xl'],
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  brandChipText: {
    ...typography.role.eyebrow,
    color: colors.neutral[0],
  },
  heroCard: {
    marginTop: 'auto',
    padding: spacing.xl,
    borderRadius: 30,
    backgroundColor: 'rgba(10, 20, 36, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    ...shadows.xl,
  },
  heroEyebrow: {
    ...typography.role.eyebrow,
    color: colors.accent.amber,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1.05,
    color: colors.neutral[0],
    fontWeight: typography.weight.bold,
    marginBottom: spacing.md,
  },
  heroSubtitle: {
    ...typography.role.deck,
    color: 'rgba(255,255,255,0.76)',
  },
  ctaBlock: {
    gap: spacing.md,
    marginTop: spacing['2xl'],
  },
  primaryCta: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.mustard,
  },
  primaryCtaGradient: {
    minHeight: 58,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  primaryCtaText: {
    fontSize: typography.size.base,
    letterSpacing: 0.25,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
  },
  secondaryCta: {
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius['2xl'],
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  secondaryCtaText: {
    fontSize: typography.size.base,
    color: colors.neutral[0],
    fontWeight: typography.weight.semibold,
  },
});
