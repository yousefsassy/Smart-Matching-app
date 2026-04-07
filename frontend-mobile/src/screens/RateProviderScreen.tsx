import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getServiceCategoryLabel, getServiceCategoryMeta } from '../constants/serviceCategories';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useServiceRequests } from '../context/ServiceRequestContext';
import { HomeStackParamList } from '../navigation/MainTabs';
import { ServiceRequest } from '../types/serviceRequest';
import PrimaryButton from '../components/PrimaryButton';
import Avatar from '../components/Avatar';
import Textarea from '../components/Textarea';
import { StarIcon, CheckCircleIcon, ChevronLeftIcon } from '../components/Icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'RateProvider'>;

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  const RATING_COLORS = [
  '',
  colors.accent.coral,
  colors.accent.amber,
  colors.accent.mustard,
  colors.accent.cyan,
  colors.success,
];

export default function RateProviderScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const { getRequestById, rateProvider } = useServiceRequests();
  const insets = useSafeAreaInsets();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animated values for each star
  const starScales = useRef([1, 2, 3, 4, 5].map(() => new Animated.Value(1))).current;

  useEffect(() => {
    const req = getRequestById(requestId);
    setRequest(req);
    if (req?.rating) {
      setRating(req.rating);
      setReview(req.review || '');
    }
  }, [requestId]);

  const handleStarPress = (star: number) => {
    setRating(star);
    // Animate the selected stars with a pop effect
    starScales.forEach((anim, idx) => {
      if (idx < star) {
        Animated.sequence([
          Animated.timing(anim, { toValue: 1.35, duration: 80 + idx * 30, useNativeDriver: true }),
          Animated.spring(anim, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 300 }),
        ]).start();
      } else {
        Animated.spring(anim, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 300 }).start();
      }
    });
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating (1-5)');
      return;
    }
    if (!request) {
      Alert.alert('Error', 'Request not found');
      return;
    }
    try {
      setIsSubmitting(true);
      await rateProvider(requestId, rating, review.trim() || undefined);
      Alert.alert(
        'Thank You!',
        'Your rating has been submitted successfully.',
        [{ text: 'OK', onPress: () => navigation.navigate('MyRequests') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={colors.gradients.header as [string, string, string]}
          style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const categoryEmoji = getServiceCategoryMeta(request.serviceCategory).emoji;
  const providerName = request.assignedProviderName || 'Service Provider';
  const serviceName = getServiceCategoryLabel(request.serviceCategory);
  const ratingColor = RATING_COLORS[rating] || colors.neutral[400];

  return (
    <View style={styles.container}>
      {/* Gradient Hero */}
      <LinearGradient
        colors={colors.gradients.header as [string, string, string]}
        style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}
      >
        {/* Decorative circles */}
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ChevronLeftIcon size={20} color={colors.neutral[0]} />
        </TouchableOpacity>

        {/* Hero content */}
        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>RATE YOUR EXPERIENCE</Text>
          <Text style={styles.heroTitle}>How did it go?</Text>
          <Text style={styles.heroSubtitle}>
            Your feedback helps the community
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Provider Summary Card */}
        <View style={styles.providerCard}>
          <LinearGradient
            colors={[colors.primary[700], colors.primary[900]]}
            style={styles.providerCardGradient}
          >
            <View style={styles.providerCardDecor} />
          </LinearGradient>
          <View style={styles.providerCardBody}>
            <View style={styles.providerAvatarRow}>
              <View style={styles.providerAvatarWrapper}>
                <Avatar name={providerName} size="lg" role="provider" />
              </View>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{providerName}</Text>
                <View style={styles.providerMeta}>
                  <View style={styles.categoryEmojiBadge}>
                    <Text style={styles.categoryEmojiText}>{categoryEmoji}</Text>
                  </View>
                  <Text style={styles.serviceType}>{serviceName}</Text>
                </View>
                <View style={styles.completedBadge}>
                  <CheckCircleIcon size={12} color={colors.success} />
                  <Text style={styles.completedText}>Service Completed</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Star Rating */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingEyebrow}>YOUR RATING</Text>
          <Text style={styles.ratingLabel}>
            {rating > 0 ? RATING_LABELS[rating] : 'Tap a star to rate'}
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= rating;
              return (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleStarPress(star)}
                  activeOpacity={0.7}
                  style={styles.starButton}
                >
                  <Animated.View style={{ transform: [{ scale: starScales[star - 1] }] }}>
                    <StarIcon
                      size={52}
                      color={isFilled ? colors.accent.gold : colors.neutral[200]}
                      filled={isFilled}
                    />
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>

          {rating > 0 && (
            <View style={[styles.ratingFeedbackRow, { borderTopColor: colors.neutral[100] }]}>
              <View style={[styles.ratingFeedbackPill, { backgroundColor: ratingColor + '15', borderColor: ratingColor + '30' }]}>
                <CheckCircleIcon size={14} color={ratingColor} />
                <Text style={[styles.ratingFeedbackText, { color: ratingColor }]}>
                  {RATING_LABELS[rating]}
                </Text>
              </View>
              <Text style={styles.ratingStarCount}>{rating} / 5 stars</Text>
            </View>
          )}
        </View>

        {/* Review Text */}
        <View style={styles.reviewCard}>
          <Text style={styles.ratingEyebrow}>WRITTEN REVIEW</Text>
          <Text style={styles.reviewSubtitle}>Optional — helps other clients choose well</Text>
          <Textarea
            value={review}
            onChangeText={setReview}
            placeholder="Share details about punctuality, quality, communication..."
            maxLength={500}
            showCharCount
            minHeight={120}
            maxHeight={200}
          />
        </View>

        <Text style={styles.helpText}>
          * Rating is required. Review is optional but appreciated.
        </Text>
      </ScrollView>

      {/* Sticky Submit Bar */}
      <View style={[styles.submitBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <PrimaryButton
          title={isSubmitting ? 'Submitting...' : 'Submit Rating'}
          onPress={handleSubmit}
          disabled={isSubmitting || rating === 0}
          loading={isSubmitting}
          icon={!isSubmitting ? <StarIcon size={18} color={colors.neutral[900]} filled /> : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.size.base,
    color: colors.neutral[600],
  },

  // Hero
  hero: {
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    overflow: 'hidden',
  },
  heroCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -60,
    right: -50,
  },
  heroCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -30,
    left: -40,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.overlay.glassSoft,
    borderWidth: 1,
    borderColor: colors.overlay.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroContent: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  heroEyebrow: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: typography.letterSpacing.widest,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.7)',
  },

  // Scroll
  scrollView: {
    flex: 1,
    marginTop: -spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },

  // Provider Card
  providerCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral[0],
    ...shadows.card,
  },
  providerCardGradient: {
    height: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  providerCardDecor: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -20,
    top: -40,
  },
  providerCardBody: {
    padding: spacing.base,
  },
  providerAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  providerAvatarWrapper: {
    borderWidth: 2,
    borderColor: colors.primary[100],
    borderRadius: 99,
    padding: 2,
  },
  providerInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  providerName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryEmojiBadge: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryEmojiText: {
    fontSize: 12,
  },
  serviceType: {
    fontSize: typography.size.sm,
    color: colors.primary[700],
    fontWeight: typography.weight.semibold,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: typography.size.xs,
    color: colors.success,
    fontWeight: typography.weight.semibold,
  },

  // Rating Card
  ratingCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  ratingEyebrow: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.neutral[400],
    letterSpacing: typography.letterSpacing.widest,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
  ratingLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
  },
  ratingFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
  },
  ratingFeedbackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  ratingFeedbackText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  ratingStarCount: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },

  // Review Card
  reviewCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  reviewSubtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    marginBottom: spacing.md,
  },

  // Submit bar
  submitBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    ...shadows.md,
  },

  helpText: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
