import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../../../components/PrimaryButton';
import { CalendarIcon, EditIcon, TagIcon } from '../../../components/Icons';
import { borderRadius, colors, spacing, typography } from '../../../theme';
import { ParsedVoiceRequest } from '../types/voice';
import {
  formatVoiceCategory,
  formatVoiceDateTime,
  formatVoiceSummary,
} from '../utils/voiceFormatting';

interface VoicePreparedRequestProps {
  parsedRequest: ParsedVoiceRequest;
  onConfirm: () => void;
  onRetry: () => void;
  onContinueInForm: () => void;
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>{icon}</View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function VoicePreparedRequest({
  parsedRequest,
  onConfirm,
  onRetry,
  onContinueInForm,
}: VoicePreparedRequestProps) {
  return (
    <View style={styles.container}>
      <View style={styles.surface}>
        <Text style={styles.sectionLabel}>What we understood</Text>
        <Text style={styles.summary}>{formatVoiceSummary(parsedRequest)}</Text>
        <Text style={styles.transcript}>"{parsedRequest.cleanedText.trim() || parsedRequest.rawText.trim()}"</Text>

        <View style={styles.details}>
          <DetailRow
            icon={<TagIcon size={16} color={colors.primary[700]} />}
            label="Service type"
            value={formatVoiceCategory(parsedRequest.category)}
          />
          <DetailRow
            icon={<EditIcon size={16} color={colors.primary[700]} />}
            label="Prepared request"
            value={parsedRequest.cleanedText.trim() || parsedRequest.issueSummary.trim()}
          />
          <DetailRow
            icon={<CalendarIcon size={16} color={colors.primary[700]} />}
            label="Preferred visit"
            value={formatVoiceDateTime(parsedRequest.preferredDateTime)}
          />
        </View>
      </View>

      <Text style={styles.guidance}>
        We will bring this into the form so you can review every detail before sending.
      </Text>

      <View style={styles.actions}>
        <PrimaryButton
          title="Review this request"
          onPress={onConfirm}
          variant="primary"
          style={styles.fullWidth}
        />
        <PrimaryButton
          title="Say it again"
          onPress={onRetry}
          variant="outline"
          style={styles.fullWidth}
        />
        <PrimaryButton
          title="Start manual form instead"
          onPress={onContinueInForm}
          variant="ghost"
          style={styles.fullWidth}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
    marginTop: spacing.xl,
  },
  surface: {
    backgroundColor: 'rgba(255,253,249,0.97)',
    borderRadius: 28,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.52)',
    gap: spacing.base,
  },
  sectionLabel: {
    ...typography.role.eyebrow,
    color: colors.primary[600],
  },
  summary: {
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
  },
  transcript: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.neutral[600],
    fontStyle: 'italic',
  },
  details: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  detailCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral[500],
    fontWeight: typography.weight.semibold,
  },
  detailValue: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.primary[900],
  },
  guidance: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: 'rgba(255,253,249,0.84)',
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
});
