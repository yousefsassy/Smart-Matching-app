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
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, animations } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useLocationSelection } from '../context/LocationSelectionContext';
import { AuthStackParamList } from '../navigation/AuthStack';
import { ServiceCategory } from '../types/serviceRequest';
import PrimaryButton from '../components/PrimaryButton';
import BasicInfoStep from '../components/ProviderSignup/BasicInfoStep';
import SecurityStep from '../components/ProviderSignup/SecurityStep';
import LocationStep from '../components/ProviderSignup/LocationStep';
import SuccessScreen from '../components/ProviderSignup/SuccessScreen';
import StepperHeader from '../components/StepperHeader';
import { ChevronLeftIcon, TawTawMarkIcon } from '../components/Icons';
import { ProviderServiceCoverage } from '../types/provider';
import {
  getConfirmPasswordError,
  getEmailError,
  getFullNameError,
  getSignupPasswordError,
} from '../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProviderSignup'>;

const TOTAL_STEPS = 2;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  serviceCoverage: ProviderServiceCoverage;
  serviceCategories: ServiceCategory[];
}

const STEP_INDICATORS = ['Personal Info', 'Professional Details'];

export default function ProviderSignupScreen({ navigation }: Props) {
  const { signup } = useAuth();
  const { consumePendingSelection } = useLocationSelection();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    serviceCoverage: {
      baseLocation: null,
    },
    serviceCategories: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  useFocusEffect(
    useCallback(() => {
      const selection = consumePendingSelection('provider-signup-location');
      if (!selection) {
        return undefined;
      }

      setFormData((prev) => ({
        ...prev,
        serviceCoverage: {
          ...prev.serviceCoverage,
          baseLocation: selection.location,
        },
      }));
      setErrors((prev) => {
        if (!prev.serviceCoverage) {
          return prev;
        }

        const next = { ...prev };
        delete next.serviceCoverage;
        return next;
      });

      return undefined;
    }, [consumePendingSelection])
  );

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
        const fullNameError = getFullNameError(formData.fullName);
        const emailError = getEmailError(formData.email);
        const passwordError = getSignupPasswordError(formData.password);
        const confirmPasswordError = getConfirmPasswordError(
          formData.password,
          formData.confirmPassword
        );

        if (fullNameError) errs.fullName = fullNameError;
        if (emailError) errs.email = emailError;
        if (passwordError) errs.password = passwordError;
        if (confirmPasswordError) errs.confirmPassword = confirmPasswordError;
        break;
      }
      case 1: {
        if (!formData.serviceCoverage.baseLocation) {
          errs.serviceCoverage = 'Please choose your base service location';
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
        serviceCoverage: formData.serviceCoverage,
        serviceCategories: formData.serviceCategories,
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
          </>
        );
      case 1:
        return (
          <LocationStep
            data={{
              serviceCoverage: formData.serviceCoverage,
              serviceCategories: formData.serviceCategories,
            }}
            errors={errors}
            onChange={handleFieldChange}
            onOpenLocationPicker={() =>
              navigation.navigate('LocationPicker', {
                mode: 'provider',
                returnScreen: 'ProviderSignup',
                selectionKey: 'provider-signup-location',
                title: 'Select your base service location',
                initialLocation: formData.serviceCoverage.baseLocation,
              })
            }
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
      <StatusBar barStyle="light-content" />
      <View style={styles.screen}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={colors.gradients.header as [string, string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <TouchableOpacity style={styles.heroBack} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <ChevronLeftIcon size={18} color={colors.neutral[0]} />
            </TouchableOpacity>
            <View style={styles.heroMark}>
              <TawTawMarkIcon size={34} />
            </View>
            <Text style={styles.heroTitle}>Create your provider account</Text>
            <Text style={styles.heroSubtitle}>A simpler two-step flow for your details and professional details.</Text>
          </LinearGradient>

          <StepperHeader
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            stepLabels={STEP_INDICATORS}
            caption=""
          />

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
  hero: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  heroBack: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay.glassSoft,
    borderWidth: 1,
    borderColor: colors.overlay.border,
    marginBottom: spacing.lg,
  },
  heroMark: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.role.heroTitle,
    color: colors.neutral[0],
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.role.body,
    color: 'rgba(255,255,255,0.76)',
    maxWidth: 300,
  },
  stepGap: {
    height: spacing.lg,
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
