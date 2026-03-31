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
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography, borderRadius, animations } from '../theme';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/AuthStack';
import { ServiceCategory } from '../types/serviceRequest';
import PrimaryButton from '../components/PrimaryButton';
import BasicInfoStep from '../components/ProviderSignup/BasicInfoStep';
import SecurityStep from '../components/ProviderSignup/SecurityStep';
import LocationStep from '../components/ProviderSignup/LocationStep';
import AvailabilityStep, { AvailabilityData } from '../components/ProviderSignup/AvailabilityStep';
import SuccessScreen from '../components/ProviderSignup/SuccessScreen';
import { ChevronLeftIcon } from '../components/Icons';

type ProviderSignupNav = NativeStackNavigationProp<AuthStackParamList, 'ProviderSignup'>;

// Step 0 = Account Info + Professional Details (scrollable single page)
// Step 1 = Availability
const TOTAL_STEPS = 2;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  city: string;
  serviceCategories: ServiceCategory[];
  availability: AvailabilityData;
}

const STEP_INDICATORS = ['Details', 'Availability'];

export default function ProviderSignupScreen() {
  const navigation = useNavigation<ProviderSignupNav>();
  const { signup } = useAuth();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    serviceCategories: [],
    availability: {
      monday:    { enabled: true,  ranges: [{ start: '09:00', end: '17:00' }] },
      tuesday:   { enabled: true,  ranges: [{ start: '09:00', end: '17:00' }] },
      wednesday: { enabled: true,  ranges: [{ start: '09:00', end: '17:00' }] },
      thursday:  { enabled: true,  ranges: [{ start: '09:00', end: '17:00' }] },
      friday:    { enabled: true,  ranges: [{ start: '09:00', end: '17:00' }] },
      saturday:  { enabled: false, ranges: [{ start: '10:00', end: '14:00' }] },
      sunday:    { enabled: false, ranges: [{ start: '10:00', end: '14:00' }] },
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    switch (step) {
      case 0: {
        if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
        else if (formData.fullName.trim().length < 2) errs.fullName = 'Name must be at least 2 characters';
        if (!formData.email.trim()) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Please enter a valid email';
        if (!formData.password) errs.password = 'Password is required';
        else if (formData.password.length < 8) errs.password = 'Must be at least 8 characters';
        if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        if (!formData.city) errs.city = 'Please select a city';
        break;
      }
      case 1: {
        const enabledDays = Object.entries(formData.availability).filter(([_, c]) => c.enabled);
        if (enabledDays.length === 0) {
          errs.availability = 'Enable at least one day';
          break;
        }
        for (const [day, config] of enabledDays) {
          if (config.ranges.length === 0) {
            errs.availability = `${day.charAt(0).toUpperCase() + day.slice(1)} needs at least one time slot`;
            break;
          }
          for (const range of config.ranges) {
            if (range.start >= range.end) {
              errs.availability = `Invalid time range in ${day.charAt(0).toUpperCase() + day.slice(1)}: start must be before end`;
              break;
            }
          }
          if (errs.availability) break;
        }
        break;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
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
    if (!validateStep(currentStep)) return;
    if (currentStep < TOTAL_STEPS - 1) {
      animateTransition('forward', () => setCurrentStep((s) => s + 1));
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
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

  const handleSubmit = async () => {
    if (!validateStep(TOTAL_STEPS - 1)) return;
    setIsSubmitting(true);
    setShowSuccess(true);
    try {
      await signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'provider',
      });
    } catch {
      setShowSuccess(false);
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <BasicInfoStep
              data={{ fullName: formData.fullName, email: formData.email }}
              errors={errors}
              onChange={handleFieldChange}
            />
            <View style={styles.stepGap} />
            <SecurityStep
              data={{ password: formData.password, confirmPassword: formData.confirmPassword }}
              errors={errors}
              onChange={handleFieldChange}
            />
            <View style={styles.stepGap} />
            <LocationStep
              data={{ city: formData.city, serviceCategories: formData.serviceCategories }}
              errors={errors}
              onChange={handleFieldChange}
            />
          </>
        );
      case 1:
        return (
          <AvailabilityStep
            data={{ availability: formData.availability }}
            errors={errors}
            onChange={handleFieldChange}
          />
        );
      default:
        return null;
    }
  };

  if (showSuccess) {
    return (
      <SuccessScreen
        providerName={formData.fullName.trim()}
        providerEmail={formData.email.trim()}
        onBackToLogin={() => navigation.navigate('Login')}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Step indicator — simple pills */}
          <View style={styles.stepIndicatorRow}>
            {STEP_INDICATORS.map((label, idx) => (
              <View key={label} style={styles.stepIndicatorItem}>
                <View style={[
                  styles.stepDot,
                  idx === currentStep && styles.stepDotActive,
                  idx < currentStep && styles.stepDotDone,
                ]}>
                  <Text style={[
                    styles.stepDotText,
                    (idx === currentStep || idx < currentStep) && styles.stepDotTextActive,
                  ]}>
                    {idx + 1}
                  </Text>
                </View>
                <Text style={[
                  styles.stepLabel,
                  idx === currentStep && styles.stepLabelActive,
                ]}>
                  {label}
                </Text>
                {idx < STEP_INDICATORS.length - 1 && (
                  <View style={[styles.stepLine, idx < currentStep && styles.stepLineDone]} />
                )}
              </View>
            ))}
          </View>

          <Animated.View
            style={{
              transform: [{ translateX: slideAnim }],
              opacity: opacityAnim,
            }}
          >
            {renderStepContent()}
          </Animated.View>

          <View style={styles.navButtons}>
            <PrimaryButton
              title={currentStep === 0 ? 'Cancel' : 'Back'}
              onPress={handleBack}
              variant="outline"
              fullWidth={false}
              style={styles.backButton}
              icon={currentStep > 0 ? <ChevronLeftIcon size={18} color={colors.primary[600]} /> : undefined}
            />

            {currentStep < TOTAL_STEPS - 1 ? (
              <PrimaryButton
                title="Next"
                onPress={handleNext}
                variant="primary"
                fullWidth={false}
                style={styles.nextButton}
              />
            ) : (
              <PrimaryButton
                title="Create Account"
                onPress={handleSubmit}
                variant="primary"
                loading={isSubmitting}
                fullWidth={false}
                style={styles.nextButton}
              />
            )}
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
    backgroundColor: colors.neutral[50],
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  stepGap: {
    height: spacing.lg,
  },

  // ── Step indicator
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  stepIndicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  stepDotDone: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[400],
  },
  stepDotText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.neutral[400],
  },
  stepDotTextActive: {
    color: colors.neutral[0],
  },
  stepLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.neutral[400],
    marginLeft: spacing.xs,
  },
  stepLabelActive: {
    color: colors.primary[600],
    fontWeight: typography.weight.bold,
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing.sm,
  },
  stepLineDone: {
    backgroundColor: colors.primary[400],
  },

  // ── Nav buttons
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
