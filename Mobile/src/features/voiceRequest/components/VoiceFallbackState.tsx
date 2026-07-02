import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../../components/PrimaryButton';
import { XCircleIcon } from '../../../components/Icons';
import { borderRadius, colors, spacing, typography } from '../../../theme';

interface VoiceFallbackStateProps {
  message: string;
  allowRetry: boolean;
  onRetry: () => void;
  onContinueInForm: () => void;
}

export default function VoiceFallbackState({
  message,
  allowRetry,
  onRetry,
  onContinueInForm,
}: VoiceFallbackStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.surface}>
        <View style={styles.iconWrap}>
          <XCircleIcon size={24} color={colors.accent.coral} />
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>

      <View style={styles.actions}>
        {allowRetry ? (
          <PrimaryButton
            title="Try again"
            onPress={onRetry}
            variant="primary"
            style={styles.fullWidth}
          />
        ) : null}
        <PrimaryButton
          title="Continue in the form"
          onPress={onContinueInForm}
          variant={allowRetry ? 'ghost' : 'primary'}
          style={styles.fullWidth}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    gap: spacing.base,
  },
  surface: {
    backgroundColor: 'rgba(255,247,243,0.97)',
    borderRadius: 28,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(199,102,77,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.primary[900],
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
});
