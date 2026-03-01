import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, animations } from '../theme';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/AuthStack';
import StepperHeader from '../components/StepperHeader';
import PrimaryButton from '../components/PrimaryButton';
import BasicInfoStep from '../components/ProviderSignup/BasicInfoStep';
import SecurityStep from '../components/ProviderSignup/SecurityStep';
import { ChevronLeftIcon } from '../components/Icons';

type ClientSignupNav = NativeStackNavigationProp<AuthStackParamList, 'ClientSignup'>;

const STEP_LABELS = ['Basic Info', 'Security'];
const SCREEN_WIDTH = Dimensions.get('window').width;

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function ClientSignupScreen() {
  const navigation = useNavigation<ClientSignupNav>();
  const { signup } = useAuth();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const handleFieldChange = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors],
  );

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    switch (step) {
      case 0: {
        if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
        else if (formData.fullName.trim().length < 2)
          errs.fullName = 'Name must be at least 2 characters';
        if (!formData.email.trim()) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Please enter a valid email';
        break;
      }
      case 1: {
        if (!formData.password) errs.password = 'Password is required';
        else if (formData.password.length < 8) errs.password = 'Must be at least 8 characters';
        if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword)
          errs.confirmPassword = 'Passwords do not match';
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
      slideAnim.setValue(enterX);
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
    if (currentStep < 1) {
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
    if (!validateStep(1)) return;
    setIsSubmitting(true);
    try {
      await signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'client',
      });
      // signup() sets isAuthenticated=true → RootNavigator switches to MainTabs automatically
    } catch (error) {
      setIsSubmitting(false);
    }
  };

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
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.screen}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StepperHeader currentStep={currentStep} totalSteps={2} stepLabels={STEP_LABELS} />

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
              icon={
                currentStep > 0 ? (
                  <ChevronLeftIcon size={18} color={colors.primary[600]} />
                ) : undefined
              }
            />

            {currentStep < 1 ? (
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
