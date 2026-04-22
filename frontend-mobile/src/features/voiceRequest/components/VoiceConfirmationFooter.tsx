import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../../components/PrimaryButton';
import { colors, spacing, typography } from '../../../theme';

interface VoiceConfirmationFooterProps {
  hasRequiredIssues: boolean;
  isSubmitting: boolean;
  onPrimaryAction: () => void;
  onEdit: () => void;
  onRetry: () => void;
}

export default function VoiceConfirmationFooter({
  hasRequiredIssues,
  isSubmitting,
  onPrimaryAction,
  onEdit,
  onRetry,
}: VoiceConfirmationFooterProps) {
  return (
    <View style={styles.container}>
      {hasRequiredIssues ? (
        <Text style={styles.helper}>
          Add the remaining details, then you can confirm the request.
        </Text>
      ) : null}

      <PrimaryButton
        title={hasRequiredIssues ? 'Add missing details' : 'Confirm with tap'}
        onPress={onPrimaryAction}
        variant="primary"
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.fullWidth}
      />
      <PrimaryButton
        title="Edit details"
        onPress={onEdit}
        variant="outline"
        disabled={isSubmitting}
        style={styles.fullWidth}
      />
      <PrimaryButton
        title="Speak again"
        onPress={onRetry}
        variant="ghost"
        disabled={isSubmitting}
        style={styles.fullWidth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  helper: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
});
