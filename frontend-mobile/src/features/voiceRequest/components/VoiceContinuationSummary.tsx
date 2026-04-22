import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../../../components/PrimaryButton';
import { CheckCircleIcon, ChevronRightIcon, SparkleIcon } from '../../../components/Icons';
import { borderRadius, colors, spacing, typography } from '../../../theme';
import { ParsedVoiceRequest } from '../types/voice';
import { MissingDetailItem } from '../utils/getMissingVoiceRequestDetails';
import {
  formatMissingDetailsSummary,
  formatVoiceSummary,
} from '../utils/voiceFormatting';

interface VoiceContinuationSummaryProps {
  parsedRequest: ParsedVoiceRequest;
  missingDetails: MissingDetailItem[];
  onContinue: () => void;
  onGoToDetail: (detail: MissingDetailItem) => void;
}

export default function VoiceContinuationSummary({
  parsedRequest,
  missingDetails,
  onContinue,
  onGoToDetail,
}: VoiceContinuationSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.surface}>
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <CheckCircleIcon size={18} color={colors.accent.cyan} />
            <Text style={styles.badgeText}>Prepared with care</Text>
          </View>
        </View>

        <Text style={styles.summary}>{formatVoiceSummary(parsedRequest)}</Text>
        <Text style={styles.body}>{formatMissingDetailsSummary(missingDetails)}</Text>

        {missingDetails.length > 0 ? (
          <View style={styles.chips}>
            {missingDetails.map((detail) => (
              <TouchableOpacity
                key={detail.field}
                accessibilityRole="button"
                activeOpacity={0.86}
                onPress={() => onGoToDetail(detail)}
                style={styles.chip}
              >
                <SparkleIcon size={12} color={colors.primary[700]} />
                <Text style={styles.chipText}>{detail.title}</Text>
                <ChevronRightIcon size={14} color={colors.primary[700]} />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>

      <PrimaryButton
        title={missingDetails.length > 0 ? 'Continue with the next detail' : 'Continue through the request'}
        onPress={onContinue}
        variant="primary"
        style={styles.fullWidth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    gap: spacing.base,
  },
  surface: {
    backgroundColor: 'rgba(232,248,239,0.96)',
    borderRadius: 28,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.52)',
    gap: spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.74)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.primary[800],
    fontWeight: typography.weight.semibold,
  },
  summary: {
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(21,122,115,0.12)',
  },
  chipText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.primary[800],
    fontWeight: typography.weight.semibold,
  },
  fullWidth: {
    width: '100%',
  },
});
