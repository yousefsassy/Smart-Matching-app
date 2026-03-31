import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, animations } from '../theme';
import { useServiceRequests } from '../context/ServiceRequestContext';
import {
  ServiceCategory,
  Location,
  TimeSlot,
  BudgetRange,
  ProviderRanking,
} from '../types/serviceRequest';
import StepperHeader from '../components/StepperHeader';
import PrimaryButton from '../components/PrimaryButton';
import { ChevronLeftIcon } from '../components/Icons';
import { HomeStackParamList } from '../navigation/MainTabs';

import ServiceTypeStep from '../components/ServiceRequest/ServiceTypeStep';
import DescribeJobStep, { DescribeJobData } from '../components/ServiceRequest/DescribeJobStep';
import ScheduleStep, {
  ScheduleData,
  TimeSlotKey,
  TIME_SLOT_RANGES,
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
  const { createServiceRequest } = useServiceRequests();

  // ── Step state ─────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Matching state ─────────────────────────────────────────────────────────
  const [showMatching, setShowMatching] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [rankedProviders, setRankedProviders] = useState<ProviderRanking[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Form data ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<FormData>({
    serviceCategory: null,
    describe: { description: '', location: '' },
    schedule: { date: null, timeSlotKey: null },
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

  const handleDescribeChange = useCallback((field: keyof DescribeJobData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      describe: { ...prev.describe, [field]: value },
    }));
    if (errors[field]) {
      setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
    }
  }, [errors]);

  const handleScheduleChange = useCallback(
    (field: keyof ScheduleData, value: Date | TimeSlotKey | null) => {
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
        if (!formData.describe.location) {
          errs.location = 'Please select your location';
        }
        break;
      }
      case 2: {
        if (!formData.schedule.date) {
          errs.date = 'Please select a date';
        }
        if (!formData.schedule.timeSlotKey) {
          errs.timeSlot = 'Please select a time slot';
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
      const timeSlot: TimeSlot = {
        date: schedule.date!.toISOString().split('T')[0],
        ...TIME_SLOT_RANGES[schedule.timeSlotKey!],
      };

      // Build BudgetRange
      let budget: BudgetRange | undefined;
      const { budget: bd } = formData;
      if (bd.preset) {
        budget = { ...BUDGET_PRESET_RANGES[bd.preset], currency: 'TND' };
      }

      // Build Location (mock coordinates for demo)
      const locationObj: Location = {
        latitude: 36.8065,
        longitude: 10.1815,
        address: formData.describe.location,
      };

      const request = await createServiceRequest({
        serviceCategory: formData.serviceCategory!,
        description: formData.describe.description,
        location: locationObj,
        timeSlot,
        budget,
      });

      // Cosmetic delay so the loading animation has time to breathe
      await new Promise((resolve) => setTimeout(resolve, 700));

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

  const handleConfirm = () => {
    if (!selectedProviderId) return;
    setShowSuccess(true);
    setTimeout(() => {
      navigation.getParent()?.navigate('RequestsTab');
    }, 1200);
  };

  const handleSkip = () => {
    setShowSuccess(true);
    setTimeout(() => {
      navigation.getParent()?.navigate('RequestsTab');
    }, 1200);
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
            errors={{ description: errors.description, location: errors.location }}
            onChange={handleDescribeChange}
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
      <LinearGradient
        colors={[colors.primary[900], colors.primary[700], colors.primary[500]]}
        style={styles.gradient}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepperHeader
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            stepLabels={STEP_LABELS}
          />

          {/* Animated step content */}
          <Animated.View
            style={{
              transform: [{ translateX: slideAnim }],
              opacity: opacityAnim,
            }}
          >
            {renderStep()}
          </Animated.View>

          {/* Navigation buttons */}
          <View style={styles.navButtons}>
            <PrimaryButton
              title={currentStep === 0 ? 'Cancel' : 'Back'}
              onPress={handleBack}
              variant="outline"
              fullWidth={false}
              style={styles.backButton}
              textStyle={{ color: colors.neutral[0] }}
              icon={currentStep > 0 ? <ChevronLeftIcon size={18} color={colors.neutral[0]} /> : undefined}
            />
            <PrimaryButton
              title={currentStep === TOTAL_STEPS - 1 ? 'Find Providers' : 'Next'}
              onPress={handleNext}
              variant="primary"
              fullWidth={false}
              style={styles.nextButton}
            />
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
    padding: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['3xl'],
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1.5,
  },
});
