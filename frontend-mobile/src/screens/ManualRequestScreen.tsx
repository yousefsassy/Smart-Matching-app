import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, animations, typography, shadows, borderRadius } from '../theme';
import { useLocationSelection } from '../context/LocationSelectionContext';
import { useServiceRequests } from '../context/ServiceRequestContext';
import {
  BudgetRange,
  TimeSlot,
} from '../types/serviceRequest';
import { NormalizedLocation } from '../types/location';
import StepperHeader from '../components/StepperHeader';
import PrimaryButton from '../components/PrimaryButton';
import { CheckCircleIcon, ChevronLeftIcon, SparkleIcon } from '../components/Icons';
import { HomeStackParamList } from '../navigation/MainTabs';
import ServiceTypeStep from '../components/ServiceRequest/ServiceTypeStep';
import DescribeJobStep, { DescribeJobData } from '../components/ServiceRequest/DescribeJobStep';
import ScheduleStep, {
  ScheduleData,
  TimeValue,
  normalizeTimeValue,
} from '../components/ServiceRequest/ScheduleStep';
import BudgetStep, { BudgetData, BudgetPreset } from '../components/ServiceRequest/BudgetStep';
import {
  buildManualRequestDraft,
  getFirstIncompleteManualRequestStep,
  ManualRequestFormData,
} from '../features/requestCreation/manualRequestDraft';

type Props = NativeStackScreenProps<HomeStackParamList, 'ManualRequest'>;

const STEP_LABELS = ['Service', 'Describe', 'Schedule', 'Budget'];
const TOTAL_STEPS = 4;
const SCREEN_WIDTH = Dimensions.get('window').width;

const BUDGET_PRESET_RANGES: Record<BudgetPreset, { min: number; max: number }> = {
  economy: { min: 50, max: 150 },
  standard: { min: 150, max: 400 },
  premium: { min: 400, max: 800 },
};

export default function ManualRequestScreen({ navigation, route }: Props) {
  const initialFormData = React.useMemo(
    () => buildManualRequestDraft(route.params?.prefill),
    [route.params?.prefill]
  );

  const { createServiceRequest } = useServiceRequests();
  const { consumePendingSelection } = useLocationSelection();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(() =>
    getFirstIncompleteManualRequestStep(initialFormData)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ManualRequestFormData>(initialFormData);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const cameFromVoice = route.params?.prefill?.source === 'voice';

  const openLocationPicker = useCallback(() => {
    navigation.navigate('LocationPicker', {
      mode: 'request',
      returnScreen: 'ManualRequest',
      selectionKey: 'manual-request-location',
      title: 'Select the request location',
      initialLocation: formData.describe.requestLocation,
    });
  }, [formData.describe.requestLocation, navigation]);

  const handleCategoryChange = useCallback((category: ManualRequestFormData['serviceCategory']) => {
    setFormData((prev) => ({ ...prev, serviceCategory: category }));
    if (errors.serviceCategory) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.serviceCategory;
        return next;
      });
    }
  }, [errors.serviceCategory]);

  const handleDescribeChange = useCallback((
    field: keyof DescribeJobData,
    value: string | NormalizedLocation | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      describe: { ...prev.describe, [field]: value },
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  useFocusEffect(
    useCallback(() => {
      const selection = consumePendingSelection('manual-request-location');
      if (!selection) {
        return undefined;
      }

      setFormData((prev) => ({
        ...prev,
        describe: {
          ...prev.describe,
          requestLocation: selection.location,
        },
      }));

      setErrors((prev) => {
        if (!prev.requestLocation) {
          return prev;
        }

        const next = { ...prev };
        delete next.requestLocation;
        return next;
      });

      return undefined;
    }, [consumePendingSelection])
  );

  const handleScheduleChange = useCallback(
    (field: keyof ScheduleData, value: Date | TimeValue | null) => {
      setFormData((prev) => ({
        ...prev,
        schedule: { ...prev.schedule, [field]: value },
      }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  const handleBudgetChange = useCallback(
    (field: keyof BudgetData, value: BudgetPreset | null) => {
      setFormData((prev) => ({
        ...prev,
        budget: { ...prev.budget, [field]: value },
      }));
    },
    []
  );

  const validateStep = (step: number): boolean => {
    const nextErrors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.serviceCategory) {
          nextErrors.serviceCategory = 'Please select a service type to continue';
        }
        break;
      case 1:
        if (!formData.describe.description.trim() || formData.describe.description.trim().length < 10) {
          nextErrors.description = 'Please describe the job (at least 10 characters)';
        }
        if (!formData.describe.requestLocation) {
          nextErrors.requestLocation = 'Please select your location';
        }
        break;
      case 2: {
        const normalizedStart = normalizeTimeValue(formData.schedule.startTime);
        const normalizedEnd = normalizeTimeValue(formData.schedule.endTime);

        if (!formData.schedule.date) {
          nextErrors.date = 'Please select a date';
        }
        if (!normalizedStart || !normalizedEnd) {
          nextErrors.timeSlot = 'Please choose both a start time and an end time';
        } else if (normalizedEnd <= normalizedStart) {
          nextErrors.timeSlot = 'End time must be later than start time';
        }
        break;
      }
      case 3:
        break;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const animateTransition = (direction: 'forward' | 'backward', callback: () => void) => {
    const exitX = direction === 'forward' ? -SCREEN_WIDTH * 0.2 : SCREEN_WIDTH * 0.2;
    const enterX = direction === 'forward' ? SCREEN_WIDTH * 0.2 : -SCREEN_WIDTH * 0.2;

    Animated.parallel([
      Animated.timing(slideAnim, { toValue: exitX, duration: 150, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(enterX);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, ...animations.spring.snappy }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < TOTAL_STEPS - 1) {
      animateTransition('forward', () => setCurrentStep((step) => step + 1));
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      return;
    }

    handleFindProviders();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateTransition('backward', () => setCurrentStep((step) => step - 1));
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      return;
    }

    navigation.goBack();
  };

  const handleFindProviders = async () => {
    try {
      const { schedule } = formData;
      const normalizedStart = normalizeTimeValue(schedule.startTime);
      const normalizedEnd = normalizeTimeValue(schedule.endTime);
      const timeSlot: TimeSlot = {
        date: schedule.date!.toISOString().split('T')[0],
        startTime: normalizedStart!,
        endTime: normalizedEnd!,
      };

      let budget: BudgetRange | undefined;
      if (formData.budget.preset) {
        budget = { ...BUDGET_PRESET_RANGES[formData.budget.preset], currency: 'TND' };
      }

      const request = await createServiceRequest({
        serviceCategory: formData.serviceCategory!,
        description: formData.describe.description,
        requestLocation: formData.describe.requestLocation!,
        timeSlot,
        budget,
      });
      navigation.replace('MatchingResults', { requestId: request.id });
    } catch {
      // Keep the user on the form if submission fails.
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ServiceTypeStep
            selectedCategory={formData.serviceCategory}
            error={errors.serviceCategory}
            onChange={handleCategoryChange}
          />
        );
      case 1:
        return (
          <DescribeJobStep
            data={formData.describe}
            errors={{
              description: errors.description,
              requestLocation: errors.requestLocation,
            }}
            onChange={handleDescribeChange}
            onOpenLocationPicker={openLocationPicker}
          />
        );
      case 2:
        return (
          <ScheduleStep
            data={formData.schedule}
            errors={{ date: errors.date, timeSlot: errors.timeSlot }}
            onChange={handleScheduleChange}
          />
        );
      case 3:
        return <BudgetStep data={formData.budget} onChange={handleBudgetChange} />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.screen}>
        <LinearGradient
          colors={colors.gradients.dark as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.topFrame, { paddingTop: insets.top + spacing.base }]}
        >
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backIconButton} onPress={handleBack} activeOpacity={0.82}>
              <ChevronLeftIcon size={18} color={colors.neutral[0]} />
            </TouchableOpacity>
            <Text style={styles.topMeta}>
              {cameFromVoice ? 'Voice draft ready' : 'Manual request'}
            </Text>
          </View>
          <Text style={styles.topTitle}>
            {cameFromVoice ? 'Review your request' : 'Fill request manually'}
          </Text>
          <Text style={styles.topSubtitle}>
            {cameFromVoice
              ? 'We filled in what we heard. You can adjust anything before we look for providers.'
              : 'Complete the request step by step with clear sections and large controls.'}
          </Text>
        </LinearGradient>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing['3xl'] }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sheet}>
            {cameFromVoice ? (
              <View style={styles.voiceBanner}>
                <View style={styles.voiceBannerBadge}>
                  <CheckCircleIcon size={16} color={colors.accent.cyan} />
                  <Text style={styles.voiceBannerBadgeText}>Voice draft added</Text>
                </View>
                <Text style={styles.voiceBannerTitle}>Your spoken request is ready to review.</Text>
                <Text style={styles.voiceBannerBody}>
                  Check the details, add the location, and continue when everything looks right.
                </Text>
              </View>
            ) : null}

            <StepperHeader
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              stepLabels={STEP_LABELS}
              caption="Client request"
            />

            <Animated.View
              style={{
                transform: [{ translateX: slideAnim }],
                opacity: opacityAnim,
              }}
            >
              {renderStep()}
            </Animated.View>

            <View style={styles.navButtons}>
              <PrimaryButton
                title={currentStep === 0 ? 'Back' : 'Back'}
                onPress={handleBack}
                variant="outline"
                fullWidth={false}
                style={styles.backButton}
                icon={currentStep > 0 ? <ChevronLeftIcon size={18} color={colors.primary[700]} /> : undefined}
              />
              <PrimaryButton
                title={currentStep === TOTAL_STEPS - 1 ? 'Find Providers' : 'Next'}
                onPress={handleNext}
                variant="primary"
                fullWidth={false}
                style={styles.nextButton}
              />
            </View>

            {!cameFromVoice ? (
              <View style={styles.choiceReminder}>
                <SparkleIcon size={14} color={colors.accent.amber} />
                <Text style={styles.choiceReminderText}>
                  Prefer speaking instead? Go back to choose the voice path.
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.surface.base,
  },
  topFrame: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  topMeta: {
    ...typography.role.eyebrow,
    color: 'rgba(255,255,255,0.54)',
  },
  topTitle: {
    ...typography.role.heroTitle,
    color: colors.neutral[0],
    marginBottom: spacing.xs,
  },
  topSubtitle: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: 'rgba(255,255,255,0.72)',
    maxWidth: 520,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  sheet: {
    marginTop: -spacing.xl,
    backgroundColor: colors.surface.base,
    borderRadius: 30,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.card,
  },
  voiceBanner: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface.raised,
    borderRadius: 28,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.card,
  },
  voiceBannerBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.successLight,
    marginBottom: spacing.base,
  },
  voiceBannerBadgeText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.primary[800],
    fontWeight: typography.weight.semibold,
  },
  voiceBannerTitle: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  voiceBannerBody: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.neutral[700],
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1.5,
  },
  choiceReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    justifyContent: 'center',
  },
  choiceReminderText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});
