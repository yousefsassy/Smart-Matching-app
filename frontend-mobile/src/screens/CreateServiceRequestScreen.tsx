import React, { useState, useRef, useCallback } from 'react';
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
import { MOCK_NETWORK_DELAYS } from '../constants/appConfig';
import { colors, spacing, borderRadius, animations, typography, shadows } from '../theme';
import { useLocationSelection } from '../context/LocationSelectionContext';
import { useServiceRequests } from '../context/ServiceRequestContext';
import {
  ServiceCategory,
  TimeSlot,
  BudgetRange,
  ProviderRanking,
} from '../types/serviceRequest';
import { NormalizedLocation } from '../types/location';
import StepperHeader from '../components/StepperHeader';
import PrimaryButton from '../components/PrimaryButton';
import { ChevronLeftIcon } from '../components/Icons';
import { HomeStackParamList } from '../navigation/MainTabs';

import ServiceTypeStep from '../components/ServiceRequest/ServiceTypeStep';
import DescribeJobStep, { DescribeJobData } from '../components/ServiceRequest/DescribeJobStep';
import ScheduleStep, {
  ScheduleData,
  TimeValue,
  normalizeTimeValue,
} from '../components/ServiceRequest/ScheduleStep';
import BudgetStep, { BudgetData, BudgetPreset } from '../components/ServiceRequest/BudgetStep';
import MatchingScreen from '../components/ServiceRequest/MatchingScreen';

type Props = NativeStackScreenProps<HomeStackParamList, 'CreateRequest'>;

const STEP_LABELS = ['Service', 'Describe', 'Schedule', 'Budget'];
const TOTAL_STEPS = 4;
const SCREEN_WIDTH = Dimensions.get('window').width;

const BUDGET_PRESET_RANGES: Record<BudgetPreset, { min: number; max: number }> = {
  economy:  { min: 50,  max: 150 },
  standard: { min: 150, max: 400 },
  premium:  { min: 400, max: 800 },
};

interface FormData {
  serviceCategory: ServiceCategory | null;
  describe: DescribeJobData;
  schedule: ScheduleData;
  budget: BudgetData;
}

export default function CreateServiceRequestScreen({ navigation }: Props) {
  const { createServiceRequest, selectProvider } = useServiceRequests();
  const { consumePendingSelection } = useLocationSelection();
  const insets = useSafeAreaInsets();
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Step state ─────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Matching state ─────────────────────────────────────────────────────────
  const [showMatching, setShowMatching] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [rankedProviders, setRankedProviders] = useState<ProviderRanking[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  // ── Form data ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<FormData>({
    serviceCategory: null,
    describe: { description: '', requestLocation: null },
    schedule: { date: null, startTime: null, endTime: null },
    budget: { preset: null },
  });

  // ── Animation refs (mirrors ProviderSignupScreen) ──────────────────────────
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  // ── Field change handlers ──────────────────────────────────────────────────

  const handleCategoryChange = useCallback((category: ServiceCategory) => {
    setFormData((prev) => ({ ...prev, serviceCategory: category }));
    if (errors.serviceCategory) {
      setErrors((prev) => { const e = { ...prev }; delete e.serviceCategory; return e; });
    }
  }, [errors]);

  const handleDescribeChange = useCallback((
    field: keyof DescribeJobData,
    value: string | NormalizedLocation | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      describe: { ...prev.describe, [field]: value },
    }));
    if (errors[field]) {
      setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
    }
  }, [errors]);

  useFocusEffect(
    useCallback(() => {
      const selection = consumePendingSelection('create-request-location');
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
        setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
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

  // ── Per-step validation ────────────────────────────────────────────────────

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    switch (step) {
      case 0: {
        if (!formData.serviceCategory) {
          errs.serviceCategory = 'Please select a service type to continue';
        }
        break;
      }
      case 1: {
        if (!formData.describe.description.trim() || formData.describe.description.trim().length < 10) {
          errs.description = 'Please describe the job (at least 10 characters)';
        }
        if (!formData.describe.requestLocation) {
          errs.requestLocation = 'Please select your location';
        }
        break;
      }
      case 2: {
        const normalizedStart = normalizeTimeValue(formData.schedule.startTime);
        const normalizedEnd = normalizeTimeValue(formData.schedule.endTime);

        if (!formData.schedule.date) {
          errs.date = 'Please select a date';
        }
        if (!normalizedStart || !normalizedEnd) {
          errs.timeSlot = 'Please choose both a start time and an end time';
        } else if (normalizedEnd <= normalizedStart) {
          errs.timeSlot = 'End time must be later than start time';
        }
        break;
      }
      case 3: {
        // Budget is fully optional — always valid
        break;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Step transition animation (copied from ProviderSignupScreen) ───────────

  const animateTransition = (direction: 'forward' | 'backward', callback: () => void) => {
    const exitX  = direction === 'forward' ? -SCREEN_WIDTH * 0.2 :  SCREEN_WIDTH * 0.2;
    const enterX = direction === 'forward' ?  SCREEN_WIDTH * 0.2 : -SCREEN_WIDTH * 0.2;

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

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < TOTAL_STEPS - 1) {
      animateTransition('forward', () => setCurrentStep((s) => s + 1));
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      // Last step → trigger matching flow
      handleFindProviders();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      animateTransition('backward', () => setCurrentStep((s) => s - 1));
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      navigation.goBack();
    }
  };

  // ── Matching flow ──────────────────────────────────────────────────────────

  const handleFindProviders = async () => {
    setShowMatching(true);
    setIsLoadingProviders(true);

    try {
      // Build TimeSlot
      const { schedule } = formData;
      const normalizedStart = normalizeTimeValue(schedule.startTime);
      const normalizedEnd = normalizeTimeValue(schedule.endTime);
      const timeSlot: TimeSlot = {
        date: schedule.date!.toISOString().split('T')[0],
        startTime: normalizedStart!,
        endTime: normalizedEnd!,
      };

      // Build BudgetRange
      let budget: BudgetRange | undefined;
      const { budget: bd } = formData;
      if (bd.preset) {
        budget = { ...BUDGET_PRESET_RANGES[bd.preset], currency: 'TND' };
      }

      const request = await createServiceRequest({
        serviceCategory: formData.serviceCategory!,
        description: formData.describe.description,
        requestLocation: formData.describe.requestLocation!,
        timeSlot,
        budget,
      });
      setCreatedRequestId(request.id);

      // Cosmetic delay so the loading animation has time to breathe
      await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAYS.matchingRevealMs));

      if (request.rankedProviders && request.rankedProviders.length > 0) {
        setRankedProviders(request.rankedProviders);
      }
    } catch {
      // On error: go back to the stepper
      setShowMatching(false);
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const handleSelectProvider = (providerId: string) => {
    setSelectedProviderId(providerId);
  };

  const exitToRequestsTab = useCallback(() => {
    completionTimeoutRef.current = setTimeout(() => {
      navigation.popToTop();
      navigation.getParent()?.navigate('RequestsTab');
    }, 1200);
  }, [navigation]);

  React.useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  const handleConfirm = async () => {
    if (!selectedProviderId || !createdRequestId) return;

    await selectProvider(createdRequestId, selectedProviderId);
    setShowSuccess(true);
    exitToRequestsTab();
  };

  const handleSkip = () => {
    setShowSuccess(true);
    exitToRequestsTab();
  };

  // ── Matching screen ────────────────────────────────────────────────────────

  if (showMatching) {
    return (
      <MatchingScreen
        isLoading={isLoadingProviders}
        providers={rankedProviders}
        selectedProviderId={selectedProviderId}
        showSuccess={showSuccess}
        onSelectProvider={handleSelectProvider}
        onConfirm={handleConfirm}
        onSkip={handleSkip}
      />
    );
  }

  // ── Step content renderer ──────────────────────────────────────────────────

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
            onOpenLocationPicker={() =>
              navigation.navigate('LocationPicker', {
                mode: 'request',
                returnScreen: 'CreateRequest',
                selectionKey: 'create-request-location',
                title: 'Select the request location',
                initialLocation: formData.describe.requestLocation,
              })
            }
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
        return (
          <BudgetStep
            data={formData.budget}
            onChange={handleBudgetChange}
          />
        );
      default:
        return null;
    }
  };

  // ── Stepper UI ─────────────────────────────────────────────────────────────

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
            <Text style={styles.topMeta}>New request</Text>
          </View>
          <Text style={styles.topTitle}>Create a request</Text>
          <Text style={styles.topSubtitle}>Search, describe, and book a slot in a few quick steps.</Text>
        </LinearGradient>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing['3xl'] }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sheet}>
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
                title={currentStep === 0 ? 'Cancel' : 'Back'}
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
    color: 'rgba(255,255,255,0.7)',
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
});
