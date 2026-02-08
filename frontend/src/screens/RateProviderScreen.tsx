import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useServiceRequests } from '../context/ServiceRequestContext';
import { HomeStackParamList } from '../navigation/MainTabs';
import { ServiceRequest } from '../types/serviceRequest';
import PrimaryButton from '../components/PrimaryButton';
import { StarIcon, UserIcon, CheckCircleIcon } from '../components/Icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'RateProvider'>;

export default function RateProviderScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const { getRequestById, rateProvider } = useServiceRequests();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const req = getRequestById(requestId);
    setRequest(req);

    // Pre-fill if already rated (shouldn't happen but just in case)
    if (req?.rating) {
      setRating(req.rating);
      setReview(req.review || '');
    }
  }, [requestId]);

  const handleStarPress = (star: number) => {
    setRating(star);
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
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to request detail or requests list
              navigation.navigate('MyRequests');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Rate Your Experience</Text>
          <Text style={styles.subtitle}>
            How was your experience with this service provider?
          </Text>

          {/* Provider Info Card */}
          <View style={styles.providerCard}>
            <View style={styles.providerAvatar}>
              <UserIcon size={32} color={colors.primary[600]} />
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>
                {request.assignedProviderName || 'Service Provider'}
              </Text>
              <Text style={styles.serviceType}>
                {request.serviceCategory.charAt(0).toUpperCase() +
                  request.serviceCategory.slice(1)}
              </Text>
            </View>
          </View>

          {/* Star Rating */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Your Rating *</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleStarPress(star)}
                  activeOpacity={0.7}
                  style={styles.starButton}
                >
                  <StarIcon
                    size={48}
                    color={colors.accent.gold}
                    filled={star <= rating}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <View style={styles.ratingFeedback}>
                <CheckCircleIcon size={20} color={colors.success} />
                <Text style={styles.ratingFeedbackText}>
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </Text>
              </View>
            )}
          </View>

          {/* Review Text */}
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Your Review (Optional)</Text>
            <Text style={styles.sectionDescription}>
              Share more about your experience to help others
            </Text>
            <View style={styles.textAreaContainer}>
              <RNTextInput
                style={styles.textArea}
                value={review}
                onChangeText={setReview}
                placeholder="Write your review here..."
                placeholderTextColor={colors.neutral[400]}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>
                {review.length} / 500
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <PrimaryButton
              title={isSubmitting ? 'Submitting...' : 'Submit Rating'}
              onPress={handleSubmit}
              disabled={isSubmitting || rating === 0}
              icon={
                isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.neutral[0]} />
                ) : (
                  <StarIcon size={20} color={colors.neutral[0]} filled />
                )
              }
            />
            <Text style={styles.helpText}>
              * Rating is required. Review is optional but appreciated.
            </Text>
          </View>
        </View>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  backButton: {
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.primary[600],
  },
  content: {
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.size.base,
    color: colors.neutral[600],
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  providerAvatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  serviceType: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
  },
  ratingSection: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  sectionDescription: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  starButton: {
    padding: spacing.xs,
  },
  ratingFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  ratingFeedbackText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.success,
  },
  reviewSection: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  textAreaContainer: {
    position: 'relative',
  },
  textArea: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    padding: spacing.base,
    fontSize: typography.size.base,
    color: colors.neutral[800],
    minHeight: 120,
    maxHeight: 200,
  },
  charCount: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    fontSize: typography.size.xs,
    color: colors.neutral[500],
  },
  submitSection: {
    marginBottom: spacing.md,
  },
  helpText: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
