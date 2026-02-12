import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useServiceRequests } from '../context/ServiceRequestContext';
import {
  ServiceCategory,
  Location,
  TimeSlot,
  BudgetRange,
  ProviderRanking,
} from '../types/serviceRequest';
import Input from '../components/Input';
import PrimaryButton from '../components/PrimaryButton';
import LocationPicker from '../components/LocationPicker';
import DatePickerField from '../components/DatePickerField';
import TimePickerField from '../components/TimePickerField';
import Chip from '../components/Chip';
import Textarea from '../components/Textarea';
import Avatar from '../components/Avatar';
import {
  SearchIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  SparkleIcon,
  CheckCircleIcon,
} from '../components/Icons';
import { HomeStackParamList } from '../navigation/MainTabs';

type Props = NativeStackScreenProps<HomeStackParamList, 'CreateRequest'>;

const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'painting', label: 'Painting' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'moving', label: 'Moving' },
  { value: 'other', label: 'Other' },
];

export default function CreateServiceRequestScreen({ navigation }: Props) {
  const { createServiceRequest } = useServiceRequests();

  // Form state
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  // Inline error state
  const [locationError, setLocationError] = useState('');
  const [dateError, setDateError] = useState('');
  const [startTimeError, setStartTimeError] = useState('');
  const [endTimeError, setEndTimeError] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const [rankedProviders, setRankedProviders] = useState<ProviderRanking[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = (): string | null => {
    let hasError = false;

    if (!location) {
      setLocationError('Please select a location');
      hasError = true;
    } else {
      setLocationError('');
    }

    if (!date) {
      setDateError('Please select a date');
      hasError = true;
    } else {
      setDateError('');
    }

    if (!startTime) {
      setStartTimeError('Please select a start time');
      hasError = true;
    } else {
      setStartTimeError('');
    }

    if (!endTime) {
      setEndTimeError('Please select an end time');
      hasError = true;
    } else {
      setEndTimeError('');
    }

    if (!serviceCategory) return 'Please select a service category';
    if (!description.trim()) return 'Please enter a description';
    if (hasError) return 'Please fix the errors above';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    try {
      setIsSubmitting(true);

      // Create location object (mock coordinates for demo)
      const locationObj: Location = {
        latitude: 36.8065,
        longitude: 10.1815,
        address: location,
      };

      // Format date as YYYY-MM-DD for the time slot
      const formattedDate = date!.toISOString().split('T')[0];

      // Format times as HH:mm strings
      const fmtTime = (d: Date) =>
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

      // Create time slot
      const timeSlot: TimeSlot = {
        date: formattedDate,
        startTime: fmtTime(startTime!),
        endTime: fmtTime(endTime!),
      };

      // Create budget range if provided
      let budget: BudgetRange | undefined;
      if (budgetMin && budgetMax) {
        budget = {
          min: parseFloat(budgetMin),
          max: parseFloat(budgetMax),
          currency: 'TND',
        };
      }

      const request = await createServiceRequest({
        serviceCategory: serviceCategory!,
        description,
        location: locationObj,
        timeSlot,
        budget,
      });

      // Show ranked providers
      if (request.rankedProviders && request.rankedProviders.length > 0) {
        setRankedProviders(request.rankedProviders);
        setShowProviders(true);
      } else {
        // No providers available - navigate directly to Requests tab
        navigation.getParent()?.navigate('RequestsTab');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectProvider = (providerId: string) => {
    setSelectedProviderId(providerId);
  };

  const handleConfirmSelection = () => {
    if (!selectedProviderId) {
      Alert.alert('No Provider Selected', 'Please select a provider or skip this step.');
      return;
    }

    // Show success message briefly, then navigate
    setShowSuccess(true);
    setTimeout(() => {
      navigation.getParent()?.navigate('RequestsTab');
    }, 1200);
  };

  const handleSkipSelection = () => {
    // Show success message briefly, then navigate
    setShowSuccess(true);
    setTimeout(() => {
      navigation.getParent()?.navigate('RequestsTab');
    }, 1200);
  };

  if (showProviders) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Success Banner */}
        {showSuccess && (
          <View style={styles.successBanner}>
            <CheckCircleIcon size={20} color={colors.neutral[0]} />
            <Text style={styles.successText}>Request created successfully!</Text>
          </View>
        )}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>AI-Matched Providers</Text>
              <Text style={styles.subtitle}>
                {rankedProviders.length} providers ranked by AI matching
              </Text>
            </View>
          </View>

          {/* Provider List */}
          <View style={styles.providersContainer}>
            {rankedProviders.map((provider, index) => (
              <TouchableOpacity
                key={provider.providerId}
                style={[
                  styles.providerCard,
                  selectedProviderId === provider.providerId && styles.providerCardSelected,
                ]}
                onPress={() => handleSelectProvider(provider.providerId)}
                activeOpacity={0.8}
              >
                <View style={styles.providerRank}>
                  <LinearGradient
                    colors={
                      index === 0
                        ? [colors.accent.gold, colors.accent.coral]
                        : [colors.primary[500], colors.primary[600]]
                    }
                    style={styles.rankBadge}
                  >
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </LinearGradient>
                </View>

                <View style={styles.providerContent}>
                  <View style={styles.providerHeader}>
                    <Avatar name={provider.providerName} size="md" role="provider" />
                    <View style={styles.providerInfo}>
                      <View style={styles.providerNameRow}>
                        <Text style={styles.providerName}>{provider.providerName}</Text>
                        {provider.isVerified && (
                          <View style={styles.verifiedBadge}>
                            <CheckCircleIcon size={14} color={colors.accent.cyan} />
                          </View>
                        )}
                      </View>
                      {provider.businessName && (
                        <Text style={styles.businessName}>{provider.businessName}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.matchScoreContainer}>
                    <SparkleIcon size={16} color={colors.accent.gold} />
                    <Text style={styles.matchScore}>{provider.matchScore}% Match</Text>
                  </View>

                  <View style={styles.providerStats}>
                    <Text style={styles.statText}>⭐ {provider.averageRating.toFixed(1)}</Text>
                    <Text style={styles.statDivider}>•</Text>
                    <Text style={styles.statText}>{provider.totalReviews} reviews</Text>
                    <Text style={styles.statDivider}>•</Text>
                    <Text style={styles.statText}>{provider.distance.toFixed(1)} km</Text>
                  </View>
                </View>

                {selectedProviderId === provider.providerId && (
                  <View style={styles.selectedIndicator}>
                    <CheckCircleIcon size={24} color={colors.primary[600]} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <PrimaryButton
              title={selectedProviderId ? 'Confirm Selection' : 'Skip for Now'}
              onPress={selectedProviderId ? handleConfirmSelection : handleSkipSelection}
            />
            {selectedProviderId && (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkipSelection}>
                <Text style={styles.skipButtonText}>Skip for Now</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ height: spacing['4xl'] }} />
        </ScrollView>
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
          <Text style={styles.title}>Create Service Request</Text>
          <Text style={styles.subtitle}>AI will find the best providers for you</Text>
        </View>

        {/* Service Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Category *</Text>
          <View style={styles.categoriesGrid}>
            {SERVICE_CATEGORIES.map((category) => (
              <Chip
                key={category.value}
                label={category.label}
                selected={serviceCategory === category.value}
                onPress={() => setServiceCategory(category.value)}
                variant="primary"
              />
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Textarea
            label="Description *"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what you need..."
            maxLength={500}
            showCharCount
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location *</Text>
          <LocationPicker
            value={location}
            onSelect={(val) => {
              setLocation(val);
              if (val) setLocationError('');
            }}
            error={locationError}
          />
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time *</Text>
          <View style={styles.inputSpacing}>
            <DatePickerField
              value={date}
              onChange={(d) => {
                setDate(d);
                if (d) setDateError('');
              }}
              error={dateError}
            />
          </View>
          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <TimePickerField
                value={startTime}
                onChange={(t) => {
                  setStartTime(t);
                  if (t) setStartTimeError('');
                }}
                placeholder="Start"
                error={startTimeError}
              />
            </View>
            <Text style={styles.timeDivider}>to</Text>
            <View style={styles.timeInput}>
              <TimePickerField
                value={endTime}
                onChange={(t) => {
                  setEndTime(t);
                  if (t) setEndTimeError('');
                }}
                placeholder="End"
                error={endTimeError}
              />
            </View>
          </View>
        </View>

        {/* Budget (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget (Optional)</Text>
          <View style={styles.budgetRow}>
            <View style={styles.budgetInput}>
              <Input
                value={budgetMin}
                onChangeText={setBudgetMin}
                placeholder="Min (TND)"
                keyboardType="numeric"
                icon={<TagIcon size={20} color={colors.neutral[400]} />}
              />
            </View>
            <Text style={styles.budgetDivider}>-</Text>
            <View style={styles.budgetInput}>
              <Input
                value={budgetMax}
                onChangeText={setBudgetMax}
                placeholder="Max (TND)"
                keyboardType="numeric"
                icon={<TagIcon size={20} color={colors.neutral[400]} />}
              />
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.section}>
          <PrimaryButton
            title={isSubmitting ? 'Creating Request...' : 'Find Providers'}
            onPress={handleSubmit}
            disabled={isSubmitting}
            icon={
              isSubmitting ? (
                <ActivityIndicator size="small" color={colors.neutral[0]} />
              ) : (
                <SearchIcon size={20} color={colors.neutral[0]} />
              )
            }
          />
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  inputSpacing: {
    marginBottom: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timeInput: {
    flex: 1,
  },
  timeDivider: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    fontWeight: typography.weight.medium,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  budgetInput: {
    flex: 1,
  },
  budgetDivider: {
    fontSize: typography.size.lg,
    color: colors.neutral[500],
    fontWeight: typography.weight.medium,
  },
  providersContainer: {
    paddingHorizontal: spacing.xl,
  },
  providerCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.neutral[100],
    ...shadows.sm,
  },
  providerCardSelected: {
    borderColor: colors.primary[600],
    ...shadows.md,
  },
  providerRank: {
    position: 'absolute',
    top: spacing.base,
    right: spacing.base,
    zIndex: 1,
  },
  rankBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  rankText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
  providerContent: {
    paddingRight: 48,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  providerInfo: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  providerName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  verifiedBadge: {
    width: 16,
    height: 16,
  },
  businessName: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
    marginTop: 2,
  },
  matchScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  matchScore: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.accent.gold,
  },
  providerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
  },
  statDivider: {
    fontSize: typography.size.sm,
    color: colors.neutral[300],
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: spacing.base,
    right: spacing.base,
  },
  actionsContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.base,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  skipButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[600],
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
});
