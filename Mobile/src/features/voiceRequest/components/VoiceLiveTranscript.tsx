import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SparkleIcon } from '../../../components/Icons';
import { borderRadius, colors, spacing, typography } from '../../../theme';

interface VoiceLiveTranscriptProps {
  transcript: string;
}

export default function VoiceLiveTranscript({ transcript }: VoiceLiveTranscriptProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SparkleIcon size={14} color={colors.accent.amber} />
        <Text style={styles.label}>Live transcript</Text>
      </View>
      <Text style={styles.value}>
        {transcript.trim() || 'Take your time. We will show your words here as we hear them.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,253,249,0.96)',
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.primary[700],
    fontWeight: typography.weight.semibold,
  },
  value: {
    fontSize: typography.size.md,
    lineHeight: 26,
    color: colors.primary[900],
  },
});
