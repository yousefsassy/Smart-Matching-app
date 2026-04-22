import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../../theme';
import { VoiceStageDescriptor } from '../types/voice';

interface VoiceStageCopyProps {
  descriptor: VoiceStageDescriptor;
}

export default function VoiceStageCopy({ descriptor }: VoiceStageCopyProps) {
  return (
    <View style={styles.container}>
      {descriptor.eyebrow ? <Text style={styles.eyebrow}>{descriptor.eyebrow}</Text> : null}
      <Text style={styles.title}>{descriptor.title}</Text>
      {descriptor.body ? <Text style={styles.body}>{descriptor.body}</Text> : null}
      <View style={styles.statusPill}>
        <Text style={styles.statusText}>{descriptor.statusLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: 'rgba(255,255,255,0.62)',
    fontWeight: typography.weight.semibold,
    letterSpacing: typography.letterSpacing.wide,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: typography.size['2xl'],
    lineHeight: typography.lineHeight['2xl'],
    letterSpacing: -0.4,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    textAlign: 'center',
  },
  body: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: 'rgba(255,253,249,0.74)',
    textAlign: 'center',
    maxWidth: 460,
  },
  statusPill: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  statusText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral[0],
    fontWeight: typography.weight.semibold,
  },
});
