import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { ProviderRanking } from '../../types/serviceRequest';
import Avatar from '../Avatar';
import PrimaryButton from '../PrimaryButton';
import { SparkleIcon, CheckCircleIcon, AIBrainIcon } from '../Icons';

interface MatchingScreenProps {
  isLoading: boolean;
  providers: ProviderRanking[];
  selectedProviderId: string | null;
  showSuccess: boolean;
  onSelectProvider: (providerId: string) => void;
  onConfirm: () => void;
  onSkip: () => void;
}

// ─── Loading dots ────────────────────────────────────────────────────────────

function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1,   duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );

    const a1 = pulse(dot1, 0);
    const a2 = pulse(dot2, 150);
    const a3 = pulse(dot3, 300);
    a1.start();
    a2.start();
    a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [dot1, dot2, dot3]);

  return (
    <View style={loadingStyles.dotsRow}>
      {[dot1, dot2, dot3].map((anim, i) => (
        <Animated.View key={i} style={[loadingStyles.dot, { opacity: anim }]} />
      ))}
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.neutral[0],
  },
});

// ─── Provider card ────────────────────────────────────────────────────────────

function ProviderCard({
  provider,
  index,
  isSelected,
  enterAnim,
  onPress,
}: {
  provider: ProviderRanking;
  index: number;
  isSelected: boolean;
  enterAnim: Animated.Value;
  onPress: () => void;
}) {
  const cardTranslateY = enterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  return (
    <Animated.View
      style={{
        opacity: enterAnim,
        transform: [{ translateY: cardTranslateY }],
      }}
    >
      <TouchableOpacity
        style={[styles.providerCard, isSelected && styles.providerCardSelected]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Rank badge */}
        <View style={styles.rankBadgeWrapper}>
          <LinearGradient
            colors={
              index === 0
                ? [colors.accent.gold, colors.accent.coral]
                : [colors.primary[500], colors.primary[700]]
            }
            style={styles.rankBadge}
          >
            <Text style={styles.rankText}>#{index + 1}</Text>
          </LinearGradient>
        </View>

        <View style={styles.cardContent}>
          {/* Provider header */}
          <View style={styles.providerHeader}>
            <Avatar name={provider.providerName} size="md" role="provider" />
            <View style={styles.providerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.providerName}>{provider.providerName}</Text>
                {provider.isVerified && (
                  <View style={styles.verifiedPill}>
                    <CheckCircleIcon size={12} color={colors.accent.cyan} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
              {provider.businessName ? (
                <Text style={styles.businessName}>{provider.businessName}</Text>
              ) : null}
            </View>
          </View>

          {/* Match score row */}
          <View style={styles.matchRow}>
            <SparkleIcon size={14} color={colors.accent.gold} />
            <Text style={styles.matchScore}>{provider.matchScore}% Match</Text>
          </View>

          {/* Match score bar */}
          <View style={styles.scoreBarTrack}>
            <LinearGradient
              colors={[colors.accent.cyan, colors.primary[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.scoreBarFill, { width: `${provider.matchScore}%` as any }]}
            />
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <Text style={styles.statText}>⭐ {provider.averageRating.toFixed(1)}</Text>
            <Text style={styles.statDot}>•</Text>
            <Text style={styles.statText}>{provider.totalReviews} reviews</Text>
            <Text style={styles.statDot}>•</Text>
            <Text style={styles.statText}>{provider.distance.toFixed(1)} km</Text>
          </View>
        </View>

        {/* Selection indicator */}
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <CheckCircleIcon size={22} color={colors.primary[600]} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function MatchingScreen({
  isLoading,
  providers,
  selectedProviderId,
  showSuccess,
  onSelectProvider,
  onConfirm,
  onSkip,
}: MatchingScreenProps) {
  // Per-card entrance animations
  const cardAnims = useRef(
    Array.from({ length: 3 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (!isLoading && providers.length > 0) {
      const animations = cardAnims.slice(0, providers.length).map((anim, i) =>
        Animated.sequence([
          Animated.delay(i * 120),
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            damping: 18,
            stiffness: 200,
          }),
        ])
      );
      Animated.parallel(animations).start();
    }
  }, [isLoading, providers.length, cardAnims]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <LinearGradient
        colors={[colors.primary[900], colors.primary[700], colors.primary[500]]}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingContent}>
          <AIBrainIcon size={64} />
          <Text style={styles.loadingTitle}>Finding your perfect match...</Text>
          <Text style={styles.loadingSubtitle}>
            Our AI is scanning the best providers for your job
          </Text>
          <LoadingDots />
        </View>
      </LinearGradient>
    );
  }

  // ── Results state ──────────────────────────────────────────────────────────
  return (
    <LinearGradient
      colors={[colors.primary[900], colors.primary[700], colors.primary[500]]}
      style={styles.resultsContainer}
    >
      {/* Success banner */}
      {showSuccess && (
        <View style={styles.successBanner}>
          <CheckCircleIcon size={18} color={colors.neutral[0]} />
          <Text style={styles.successText}>Request created successfully!</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.resultsHeader}>
          <View style={styles.resultsHeaderIcon}>
            <SparkleIcon size={24} color={colors.accent.gold} />
          </View>
          <Text style={styles.resultsTitle}>AI-Matched Providers</Text>
          <Text style={styles.resultsSubtitle}>
            {providers.length} providers ranked for your job
          </Text>
        </View>

        {/* Provider cards */}
        <View style={styles.cardsContainer}>
          {providers.map((provider, index) => (
            <ProviderCard
              key={provider.providerId}
              provider={provider}
              index={index}
              isSelected={selectedProviderId === provider.providerId}
              enterAnim={cardAnims[index] ?? new Animated.Value(1)}
              onPress={() => onSelectProvider(provider.providerId)}
            />
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <PrimaryButton
            title={selectedProviderId ? 'Confirm Selection' : 'Select a Provider Above'}
            onPress={onConfirm}
            disabled={!selectedProviderId}
          />
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  loadingTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  loadingSubtitle: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Results
  resultsContainer: {
    flex: 1,
  },
  successBanner: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  successText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resultsHeaderIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  resultsTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    marginBottom: spacing.xs,
  },
  resultsSubtitle: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  cardsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  // Provider card
  providerCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    borderWidth: 2,
    borderColor: colors.neutral[100],
    flexDirection: 'row',
    ...shadows.md,
    position: 'relative',
  },
  providerCardSelected: {
    borderColor: colors.primary[600],
    ...shadows.lg,
  },
  rankBadgeWrapper: {
    marginRight: spacing.md,
    alignItems: 'center',
  },
  rankBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  rankText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
  cardContent: {
    flex: 1,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  providerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  providerName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${colors.accent.cyan}15`,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: typography.weight.semibold,
    color: colors.accent.cyan,
  },
  businessName: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    marginTop: 1,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  matchScore: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.accent.gold,
  },
  scoreBarTrack: {
    height: 4,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
  },
  statDot: {
    fontSize: typography.size.sm,
    color: colors.neutral[300],
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: spacing.base,
    right: spacing.base,
  },

  // CTA
  ctaContainer: {
    gap: spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: 'rgba(255,255,255,0.8)',
  },
});
