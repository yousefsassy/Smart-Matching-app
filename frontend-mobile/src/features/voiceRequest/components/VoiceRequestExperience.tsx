import React, { useEffect, useMemo } from 'react';
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SparkleIcon } from '../../../components/Icons';
import { borderRadius, colors, shadows, spacing, typography } from '../../../theme';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import { useVoiceStagePresentation } from '../hooks/useVoiceStagePresentation';
import {
  ParsedVoiceRequest,
  VoiceCaptureSupport,
  VoicePermissionState,
  VoiceRequestStage,
} from '../types/voice';
import { MissingDetailItem } from '../utils/getMissingVoiceRequestDetails';
import VoiceContinuationSummary from './VoiceContinuationSummary';
import VoiceFallbackState from './VoiceFallbackState';
import VoiceHalo from './VoiceHalo';
import VoiceLiveTranscript from './VoiceLiveTranscript';
import VoicePreparedRequest from './VoicePreparedRequest';
import VoiceStageCopy from './VoiceStageCopy';

interface VoiceRequestExperienceProps {
  stage: VoiceRequestStage;
  support: VoiceCaptureSupport;
  transcript: string;
  interimTranscript: string;
  parsedRequest: ParsedVoiceRequest | null;
  errorMessage: string | null;
  permissionState: VoicePermissionState;
  canStart: boolean;
  canStop: boolean;
  missingDetails: MissingDetailItem[];
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onConfirm: () => void;
  onRetry: () => void;
  onContinueInForm: () => void;
  onContinueFromSummary: () => void;
  onGoToDetail: (detail: MissingDetailItem) => void;
}

function getShellGradient(stage: VoiceRequestStage) {
  switch (stage) {
    case 'listening':
      return ['#102234', '#21496D', '#1A3855'] as [string, string, string];
    case 'processing':
      return ['#122234', '#23445D', '#325E73'] as [string, string, string];
    case 'review':
      return ['#0F1F31', '#264360', '#17314B'] as [string, string, string];
    case 'confirmed':
      return ['#12312B', '#235245', '#214A3E'] as [string, string, string];
    case 'error':
      return ['#301A18', '#59312E', '#40211E'] as [string, string, string];
    case 'idle':
    default:
      return ['#08111C', '#17324B', '#264A67'] as [string, string, string];
  }
}

export default function VoiceRequestExperience({
  stage,
  support,
  transcript,
  interimTranscript,
  parsedRequest,
  errorMessage,
  permissionState,
  canStart,
  canStop,
  missingDetails,
  onStart,
  onStop,
  onConfirm,
  onRetry,
  onContinueInForm,
  onContinueFromSummary,
  onGoToDetail,
}: VoiceRequestExperienceProps) {
  const reducedMotion = useReducedMotionPreference();
  const descriptor = useVoiceStagePresentation({
    stage,
    support,
    permissionState,
    missingDetailsCount: missingDetails.length,
  });
  const liveTranscript = useMemo(
    () => interimTranscript.trim() || transcript.trim(),
    [interimTranscript, transcript]
  );
  const haloPress = canStop ? onStop : canStart ? onStart : undefined;
  const haloLabel = descriptor.primaryActionLabel ?? descriptor.statusLabel;
  const showProcessingNote = stage === 'processing';
  const allowRetry = stage === 'error' && support.isVoiceFlowAvailable && permissionState !== 'denied';

  useEffect(() => {
    if (Platform.OS !== 'web' && typeof AccessibilityInfo.announceForAccessibility !== 'function') {
      return;
    }

    AccessibilityInfo.announceForAccessibility?.(descriptor.announcement);
  }, [descriptor.announcement]);

  return (
    <View style={styles.frame}>
      <LinearGradient
        colors={getShellGradient(stage)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.shell}
      >
        <View style={styles.glowLarge} />
        <View style={styles.glowSmall} />

        <VoiceStageCopy descriptor={descriptor} />

        <View accessible accessibilityLiveRegion="polite" style={styles.haloWrap}>
          <VoiceHalo
            tone={descriptor.tone}
            label={haloLabel}
            statusLabel={descriptor.statusLabel}
            accessibilityHint={descriptor.primaryActionHint}
            onPress={haloPress}
            disabled={!haloPress}
            reducedMotion={reducedMotion}
          />
        </View>

        {stage === 'listening' ? (
          <VoiceLiveTranscript transcript={liveTranscript} />
        ) : null}

        {showProcessingNote ? (
          <View style={styles.processingNote}>
            <Text style={styles.processingText}>
              We are shaping your words into a calm, easy-to-review request.
            </Text>
          </View>
        ) : null}

        {stage === 'review' && parsedRequest ? (
          <VoicePreparedRequest
            parsedRequest={parsedRequest}
            onConfirm={onConfirm}
            onRetry={onRetry}
            onContinueInForm={onContinueInForm}
          />
        ) : null}

        {stage === 'confirmed' && parsedRequest ? (
          <VoiceContinuationSummary
            parsedRequest={parsedRequest}
            missingDetails={missingDetails}
            onContinue={onContinueFromSummary}
            onGoToDetail={onGoToDetail}
          />
        ) : null}

        {stage === 'error' ? (
          <VoiceFallbackState
            message={errorMessage ?? descriptor.body}
            allowRetry={allowRetry}
            onRetry={onRetry}
            onContinueInForm={onContinueInForm}
          />
        ) : null}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    marginBottom: spacing.xl,
    borderRadius: 36,
    overflow: 'hidden',
    ...shadows.xl,
  },
  shell: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  glowLarge: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(232,178,78,0.16)',
    top: -40,
    right: -60,
  },
  glowSmall: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -40,
    left: -20,
  },
  haloWrap: {
    marginTop: spacing.xl,
  },
  promiseRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  promiseText: {
    flexShrink: 1,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: 'rgba(255,253,249,0.78)',
    textAlign: 'center',
  },
  processingNote: {
    marginTop: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  processingText: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.neutral[0],
    textAlign: 'center',
  },
});
