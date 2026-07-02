import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeftIcon, MicrophoneIcon } from '../components/Icons';
import PrimaryButton from '../components/PrimaryButton';
import { useLocationSelection } from '../context/LocationSelectionContext';
import { useServiceRequests } from '../context/ServiceRequestContext';
import VoiceRequestExperience from '../features/voiceRequest/components/VoiceRequestExperience';
import VoiceRequestEditSheet from '../features/voiceRequest/components/VoiceRequestEditSheet';
import VoiceRequestReview from '../features/voiceRequest/components/VoiceRequestReview';
import { useVoiceConfirmationFlow } from '../features/voiceRequest/hooks/useVoiceConfirmationFlow';
import { useVoiceRequestFlow } from '../features/voiceRequest/hooks/useVoiceRequestFlow';
import {
  VoiceConfirmationIntent,
  VoiceRequestDraft,
  VoiceRequestPhase,
  VoiceReviewStep,
} from '../features/voiceRequest/types/voice';
import { classifyConfirmationCommand } from '../features/voiceRequest/utils/confirmationCommand';
import {
  getVoiceDraftIssues,
  isVoiceDraftLowConfidence,
} from '../features/voiceRequest/utils/getVoiceDraftIssues';
import { mapParsedVoiceRequestToDraft } from '../features/voiceRequest/utils/mapParsedVoiceRequestToDraft';
import { HomeStackParamList } from '../navigation/MainTabs';
import { BudgetRange, TimeSlot } from '../types/serviceRequest';
import { normalizeTimeValue } from '../components/ServiceRequest/ScheduleStep';
import { getLocationSearchProvider } from '../services/location/locationProvider';
import { borderRadius, colors, shadows, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'VoiceRequest'>;

function buildRequestDescription(draft: VoiceRequestDraft) {
  const summary = draft.summary.trim();
  const notes = draft.notes.trim();

  if (!notes) {
    return summary;
  }

  return `${summary}\n\nAdditional note: ${notes}`;
}

export default function VoiceRequestScreen({ navigation, route }: Props) {
  const { createServiceRequest } = useServiceRequests();
  const { consumePendingSelection } = useLocationSelection();
  const insets = useSafeAreaInsets();
  const locationProvider = useRef(getLocationSearchProvider()).current;
  const autoStartTriggeredRef = useRef(false);
  const submitLockRef = useRef(false);
  const [reviewStep, setReviewStep] = useState<VoiceReviewStep>('review');
  const [draft, setDraft] = useState<VoiceRequestDraft | null>(null);
  const [confirmationIntent, setConfirmationIntent] =
    useState<VoiceConfirmationIntent>('unknown');
  const [confirmationError, setConfirmationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const voiceRequestFlow = useVoiceRequestFlow();
  const confirmationFlow = useVoiceConfirmationFlow();
  const currentDraft =
    draft ??
    (voiceRequestFlow.parsedRequest
      ? mapParsedVoiceRequestToDraft(voiceRequestFlow.parsedRequest)
      : null);

  const currentIssues = useMemo(
    () => (currentDraft ? getVoiceDraftIssues(currentDraft) : []),
    [currentDraft]
  );
  const isLowConfidence = currentDraft ? isVoiceDraftLowConfidence(currentDraft) : false;
  const hasBlockingDraftIssues = currentIssues.length > 0;
  const isReviewFlowVisible = Boolean(currentDraft);

  const screenPhase: VoiceRequestPhase = useMemo(() => {
    if (isSubmitting) {
      return 'submittingRequest';
    }

    if (confirmationFlow.stage === 'listening') {
      return 'listeningForConfirmation';
    }

    if (isReviewFlowVisible) {
      return reviewStep === 'edit' ? 'reviewingDraft' : 'awaitingConfirmation';
    }

    return 'capturingRequest';
  }, [confirmationFlow.stage, isReviewFlowVisible, isSubmitting, reviewStep]);

  const handleSwitchToManual = useCallback(() => {
    navigation.replace('ManualRequest', {
      prefill: currentDraft
        ? {
            serviceCategory: currentDraft.serviceCategory,
            description: buildRequestDescription(currentDraft),
            scheduleDateIso: currentDraft.preferredDate?.toISOString() ?? null,
            startTime: currentDraft.startTime,
            endTime: currentDraft.endTime,
            source: 'voice',
          }
        : undefined,
    });
  }, [currentDraft, navigation]);

  const resetConfirmationState = useCallback(() => {
    confirmationFlow.reset();
    setConfirmationIntent('unknown');
    setConfirmationError(null);
  }, [confirmationFlow]);

  useEffect(() => {
    if (!voiceRequestFlow.parsedRequest) {
      setDraft(null);
      setReviewStep('review');
      resetConfirmationState();
      return;
    }

    setDraft(mapParsedVoiceRequestToDraft(voiceRequestFlow.parsedRequest));
    setReviewStep('review');
    resetConfirmationState();
  }, [resetConfirmationState, voiceRequestFlow.parsedRequest]);

  useEffect(() => {
    if (!route.params?.autoStart || autoStartTriggeredRef.current || voiceRequestFlow.parsedRequest) {
      return undefined;
    }

    if (!voiceRequestFlow.canStart || voiceRequestFlow.stage !== 'idle') {
      return undefined;
    }

    autoStartTriggeredRef.current = true;
    const timeoutId = setTimeout(() => {
      void voiceRequestFlow.startListening();
    }, 420);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    route.params?.autoStart,
    voiceRequestFlow.canStart,
    voiceRequestFlow.parsedRequest,
    voiceRequestFlow.stage,
    voiceRequestFlow.startListening,
  ]);

  useEffect(() => {
    let isCancelled = false;

    async function resolveSpokenLocation() {
      if (!draft?.locationHint.trim() || draft.requestLocation) {
        return;
      }

      const results = await locationProvider.search(draft.locationHint);
      const [bestMatch] = results;
      if (!bestMatch || isCancelled) {
        return;
      }

      setDraft((currentValue) => {
        if (!currentValue || currentValue.requestLocation) {
          return currentValue;
        }

        return {
          ...currentValue,
          requestLocation: {
            ...bestMatch.location,
            geoSource: 'search',
            lastUpdatedAt: new Date().toISOString(),
          },
        };
      });
    }

    void resolveSpokenLocation();

    return () => {
      isCancelled = true;
    };
  }, [draft?.locationHint, draft?.requestLocation, locationProvider]);

  useFocusEffect(
    useCallback(() => {
      const selection = consumePendingSelection('voice-request-location');
      if (!selection) {
        return undefined;
      }

      setDraft((currentValue) => {
        if (!currentValue) {
          return currentValue;
        }

        return {
          ...currentValue,
          requestLocation: selection.location,
        };
      });

      return undefined;
    }, [consumePendingSelection])
  );

  const handleRetry = useCallback(() => {
    setDraft(null);
    setReviewStep('review');
    setConfirmationIntent('unknown');
    setConfirmationError(null);
    confirmationFlow.reset();
    voiceRequestFlow.retry();
  }, [confirmationFlow, voiceRequestFlow]);

  const openLocationPicker = useCallback(() => {
    if (!currentDraft) {
      return;
    }

    navigation.navigate('LocationPicker', {
      mode: 'request',
      returnScreen: 'VoiceRequest',
      selectionKey: 'voice-request-location',
      title: 'Select the request location',
      initialLocation: currentDraft.requestLocation,
    });
  }, [currentDraft, navigation]);

  const handleSubmitVoiceRequest = useCallback(async () => {
    if (submitLockRef.current) {
      return;
    }

    if (
      !currentDraft ||
      !currentDraft.serviceCategory ||
      !currentDraft.requestLocation ||
      !currentDraft.preferredDate
    ) {
      setReviewStep('edit');
      setConfirmationIntent('unknown');
      setConfirmationError('Please complete the missing details before confirming.');
      return;
    }

    const normalizedStart = normalizeTimeValue(currentDraft.startTime);
    const normalizedEnd = normalizeTimeValue(currentDraft.endTime);
    if (!normalizedStart || !normalizedEnd || normalizedEnd <= normalizedStart) {
      setReviewStep('edit');
      setConfirmationIntent('unknown');
      setConfirmationError('Please add a valid time slot before confirming.');
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setConfirmationError(null);

    let didNavigate = false;

    try {
      const timeSlot: TimeSlot = {
        date: currentDraft.preferredDate.toISOString().split('T')[0],
        startTime: normalizedStart,
        endTime: normalizedEnd,
      };

      const budget: BudgetRange | undefined = currentDraft.budgetRange ?? undefined;

      const request = await createServiceRequest({
        serviceCategory: currentDraft.serviceCategory,
        description: buildRequestDescription(currentDraft),
        requestLocation: currentDraft.requestLocation,
        timeSlot,
        budget,
      });

      didNavigate = true;
      navigation.replace('MatchingResults', { requestId: request.id });
    } catch {
      setConfirmationIntent('unknown');
      setConfirmationError('We could not create the request. Please try again.');
    } finally {
      submitLockRef.current = false;
      if (!didNavigate) {
        setIsSubmitting(false);
      }
    }
  }, [createServiceRequest, currentDraft, navigation]);

  const handleConfirmationMicPress = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    if (confirmationFlow.canStop) {
      const heardTranscript = await confirmationFlow.stopListening();
      if (!heardTranscript) {
        return;
      }

      const result = classifyConfirmationCommand(heardTranscript);
      setConfirmationIntent(result.intent);

      switch (result.intent) {
        case 'confirm':
          if (hasBlockingDraftIssues) {
            setReviewStep('edit');
            setConfirmationError('Please complete the missing details before confirming.');
            return;
          }

          setConfirmationError(null);
          await handleSubmitVoiceRequest();
          return;
        case 'reject':
          setConfirmationError(null);
          return;
        case 'restart':
          handleRetry();
          return;
        case 'ambiguous':
        case 'unknown':
        default:
          setConfirmationError(
            result.normalizedTranscript
              ? `I heard "${result.normalizedTranscript}". Please say "confirm" or "cancel".`
              : 'Please say "confirm", "cancel", or "start over".'
          );
      }

      return;
    }

    setConfirmationIntent('unknown');
    setConfirmationError(null);
    await confirmationFlow.startListening();
  }, [
    confirmationFlow,
    handleRetry,
    handleSubmitVoiceRequest,
    hasBlockingDraftIssues,
    isSubmitting,
  ]);

  const confirmationMessage = confirmationError ?? confirmationFlow.errorMessage;

  const topTitle =
    screenPhase === 'reviewingDraft'
      ? 'Adjust request'
      : screenPhase === 'awaitingConfirmation' || screenPhase === 'listeningForConfirmation'
        ? 'Review and confirm'
        : screenPhase === 'submittingRequest'
          ? 'Submitting request'
          : 'Speak your request';

  const topSubtitle =
    screenPhase === 'reviewingDraft'
      ? 'Make any changes you need, then return to the confirmation step.'
      : screenPhase === 'awaitingConfirmation'
        ? 'We prepared the request for you. Review it, then confirm by voice or by tap.'
        : screenPhase === 'listeningForConfirmation'
          ? 'We are listening only for a confirmation command like "confirm" or "cancel".'
          : screenPhase === 'submittingRequest'
            ? 'Your request is being created and we are preparing the matching page.'
            : 'You will review the prepared summary before continuing.';

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.82}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeftIcon size={18} color={colors.primary[800]} />
        </TouchableOpacity>

        <View style={styles.topCopy}>
          <View style={styles.topLabelRow}>
            <MicrophoneIcon size={14} color={colors.primary[700]} />
            <Text style={styles.topLabel}>Voice request</Text>
          </View>
          <Text style={styles.topTitle}>{topTitle}</Text>
          <Text style={styles.topSubtitle}>{topSubtitle}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing['4xl'] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheet}>
          {isReviewFlowVisible && currentDraft ? (
            reviewStep === 'edit' ? (
              <VoiceRequestEditSheet
                draft={currentDraft}
                issues={currentIssues}
                onChange={setDraft}
                onOpenLocationPicker={openLocationPicker}
                onDone={() => setReviewStep('review')}
              />
            ) : (
              <VoiceRequestReview
                draft={currentDraft}
                issues={currentIssues}
                isLowConfidence={isLowConfidence}
                confirmationStage={confirmationFlow.stage}
                confirmationIntent={confirmationIntent}
                confirmationTranscript={confirmationFlow.transcript}
                confirmationError={confirmationMessage}
                isSubmitting={isSubmitting}
                onConfirmationMicPress={handleConfirmationMicPress}
                onTapConfirm={handleSubmitVoiceRequest}
                onEdit={() => {
                  resetConfirmationState();
                  setReviewStep('edit');
                }}
                onRetry={handleRetry}
              />
            )
          ) : (
            <>
              <VoiceRequestExperience
                stage={voiceRequestFlow.stage}
                support={voiceRequestFlow.support}
                transcript={voiceRequestFlow.transcript}
                interimTranscript={voiceRequestFlow.interimTranscript}
                parsedRequest={voiceRequestFlow.parsedRequest}
                errorMessage={voiceRequestFlow.errorMessage}
                permissionState={voiceRequestFlow.permissionState}
                canStart={voiceRequestFlow.canStart}
                canStop={voiceRequestFlow.canStop}
                missingDetails={[]}
                onStart={voiceRequestFlow.startListening}
                onStop={voiceRequestFlow.stopListening}
                onConfirm={voiceRequestFlow.confirmReview}
                onRetry={voiceRequestFlow.retry}
                onContinueInForm={handleSwitchToManual}
                onContinueFromSummary={handleSwitchToManual}
                onGoToDetail={handleSwitchToManual}
              />

              <View style={styles.manualSwitchPanel}>
                <Text style={styles.manualSwitchTitle}>Prefer to type instead?</Text>
                <Text style={styles.manualSwitchBody}>
                  You can move to the manual form at any time and complete the request step by step.
                </Text>
                <PrimaryButton
                  title="Fill request manually"
                  onPress={handleSwitchToManual}
                  variant="outline"
                  style={styles.manualSwitchButton}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface.base,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.base,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.raised,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.card,
  },
  topCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  topLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topLabel: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.primary[600],
    fontWeight: typography.weight.semibold,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  topTitle: {
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.4,
  },
  topSubtitle: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral[600],
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sheet: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
    backgroundColor: colors.surface.base,
    borderRadius: 32,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.card,
  },
  manualSwitchPanel: {
    marginTop: spacing.base,
    backgroundColor: colors.surface.raised,
    borderRadius: 28,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.card,
  },
  manualSwitchTitle: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  manualSwitchBody: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.neutral[700],
  },
  manualSwitchButton: {
    marginTop: spacing.lg,
  },
});
