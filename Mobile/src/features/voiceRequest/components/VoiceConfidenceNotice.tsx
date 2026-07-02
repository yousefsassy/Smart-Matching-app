import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SparkleIcon } from '../../../components/Icons';
import { borderRadius, colors, spacing, typography } from '../../../theme';
import { VoiceDraftIssue } from '../types/voice';

interface VoiceConfidenceNoticeProps {
  issues: VoiceDraftIssue[];
  isLowConfidence: boolean;
  onEdit: () => void;
}

export default function VoiceConfidenceNotice({
  issues,
  isLowConfidence,
  onEdit,
}: VoiceConfidenceNoticeProps) {
  if (!issues.length && !isLowConfidence) {
    return null;
  }

  const title = issues.length
    ? issues.length === 1
      ? 'We need one more detail'
      : 'A few details need a quick review'
    : 'Please review this request';

  const body = issues.length
    ? issues[0].prompt
    : 'We prepared the request for you. A quick check will help make sure everything looks right.';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <SparkleIcon size={16} color={colors.accent.amber} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
      </View>

      {issues.length ? (
        <View style={styles.chips}>
          {issues.map((issue) => (
            <TouchableOpacity
              key={issue.field}
              accessibilityRole="button"
              activeOpacity={0.86}
              onPress={onEdit}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{issue.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,253,249,0.98)',
    borderRadius: 26,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.base,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(232,178,78,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
  },
  body: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.neutral[700],
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.tint,
  },
  chipText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.primary[800],
    fontWeight: typography.weight.semibold,
  },
});
