import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../../theme';
import {
  VoiceConfirmationIntent,
  VoiceConfirmationStage,
  VoiceDraftIssue,
  VoiceRequestDraft,
} from '../types/voice';
import VoiceConfirmationPrompt from './VoiceConfirmationPrompt';
import VoiceConfidenceNotice from './VoiceConfidenceNotice';
import VoiceConfirmationFooter from './VoiceConfirmationFooter';
import VoiceRequestSummary from './VoiceRequestSummary';

interface VoiceRequestReviewProps {
  draft: VoiceRequestDraft;
  issues: VoiceDraftIssue[];
  isLowConfidence: boolean;
  confirmationStage: VoiceConfirmationStage;
  confirmationIntent: VoiceConfirmationIntent;
  confirmationTranscript: string;
  confirmationError: string | null;
  isSubmitting: boolean;
  onConfirmationMicPress: () => void;
  onTapConfirm: () => void;
  onEdit: () => void;
  onRetry: () => void;
}

export default function VoiceRequestReview({
  draft,
  issues,
  isLowConfidence,
  confirmationStage,
  confirmationIntent,
  confirmationTranscript,
  confirmationError,
  isSubmitting,
  onConfirmationMicPress,
  onTapConfirm,
  onEdit,
  onRetry,
}: VoiceRequestReviewProps) {
  return (
    <View style={styles.container}>
      <VoiceConfidenceNotice
        issues={issues}
        isLowConfidence={isLowConfidence}
        onEdit={onEdit}
      />
      <VoiceRequestSummary draft={draft} />
      <VoiceConfirmationPrompt
        stage={confirmationStage}
        transcript={confirmationTranscript}
        intent={confirmationIntent}
        errorMessage={confirmationError}
        isDisabled={issues.length > 0 || isSubmitting}
        onMicPress={onConfirmationMicPress}
      />
      <VoiceConfirmationFooter
        hasRequiredIssues={issues.length > 0}
        isSubmitting={isSubmitting}
        onPrimaryAction={issues.length > 0 ? onEdit : onTapConfirm}
        onEdit={onEdit}
        onRetry={onRetry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
});
