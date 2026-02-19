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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, animations } from '../theme';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/AuthStack';
import StepperHeader from '../components/StepperHeader';
import PrimaryButton from '../components/PrimaryButton';
import BasicInfoStep from '../components/ProviderSignup/BasicInfoStep';
import SecurityStep from '../components/ProviderSignup/SecurityStep';
import LocationStep from '../components/ProviderSignup/LocationStep';
import AvailabilityStep, { AvailabilityData } from '../components/ProviderSignup/AvailabilityStep';
import { ChevronLeftIcon } from '../components/Icons';

type ProviderSignupNav = NativeStackNavigationProp<AuthStackParamList, 'ProviderSignup'>;

const STEP_LABELS = ['Basic Info', 'Security', 'Location', 'Availability'];
const SCREEN_WIDTH = Dimensions.get('window').width;

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  city: string;
  radius: number;
  availability: AvailabilityData;
}

export default function ProviderSignupScreen() {
  const navigation = useNavigation<ProviderSignupNav>();
  const { signup } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    radius: 10,
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

  // Animation refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Field change handler — clears related error
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

  // Per-step validation
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    switch (step) {
      case 0: {
        if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
        else if (formData.fullName.trim().length < 2) errs.fullName = 'Name must be at least 2 characters';
        if (!formData.email.trim()) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Please enter a valid email';
        break;
      }
      case 1: {
        if (!formData.password) errs.password = 'Password is required';
        else if (formData.password.length < 8) errs.password = 'Must be at least 8 characters';
        if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        break;
      }
      case 2: {
        if (!formData.city) errs.city = 'Please select a city';
        break;
      }
      case 3: {
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

  // Animate step transition
  const animateTransition = (direction: 'forward' | 'backward', callback: () => void) => {
    const exitX = direction === 'forward' ? -SCREEN_WIDTH * 0.2 : SCREEN_WIDTH * 0.2;
    const enterX = direction === 'forward' ? SCREEN_WIDTH * 0.2 : -SCREEN_WIDTH * 0.2;

    // Slide out current
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: exitX,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      // Reset position to enter from other side
      slideAnim.setValue(enterX);
      // Slide in new
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          ...animations.spring.snappy,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < 3) {
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
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      // Register the provider via AuthContext (adds to mock DB + auto-logs in)
      await signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'provider',
      });
      // signup() sets isAuthenticated=true, which triggers RootNavigator
      // to switch to MainTabs → ProviderDashboard automatically
    } catch (error) {
      // If signup fails, stay on the form
      setIsSubmitting(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            data={{ fullName: formData.fullName, email: formData.email }}
            errors={errors}
            onChange={handleFieldChange}
          />
        );
      case 1:
        return (
          <SecurityStep
            data={{ password: formData.password, confirmPassword: formData.confirmPassword }}
            errors={errors}
            onChange={handleFieldChange}
          />
        );
      case 2:
        return (
          <LocationStep
            data={{ city: formData.city, radius: formData.radius }}
            errors={errors}
            onChange={handleFieldChange}
          />
        );
      case 3:
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
            totalSteps={4}
            stepLabels={STEP_LABELS}
          />

          {/* Step content with animation */}
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
                textStyle={{ color: colors.neutral[0] }}
                icon={currentStep > 0 ? <ChevronLeftIcon size={18} color={colors.neutral[0]} /> : undefined}
              />

              {currentStep < 3 ? (
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
