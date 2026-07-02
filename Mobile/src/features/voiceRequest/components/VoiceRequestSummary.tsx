import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EditIcon,
  MapPinIcon,
  TagIcon,
} from '../../../components/Icons';
import { borderRadius, colors, spacing, typography } from '../../../theme';
import { VoiceRequestDraft } from '../types/voice';
import {
  formatVoiceBudget,
  formatVoiceCategory,
  formatVoiceDraftSchedule,
  formatVoiceLocation,
  formatVoicePriority,
} from '../utils/voiceFormatting';

interface VoiceRequestSummaryProps {
  draft: VoiceRequestDraft;
}

function SummaryRow({
  icon,
  label,
  value,
  isMuted = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isMuted?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, isMuted && styles.rowValueMuted]}>{value}</Text>
      </View>
    </View>
  );
}

export default function VoiceRequestSummary({ draft }: VoiceRequestSummaryProps) {
  const [showSpokenWords, setShowSpokenWords] = useState(false);
  const hasNotes = Boolean(draft.notes.trim());
  const priorityLabel = formatVoicePriority(draft.urgency);

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.badge}>
          <CheckCircleIcon size={16} color={colors.accent.cyan} />
          <Text style={styles.badgeText}>Prepared for you</Text>
        </View>
        <Text style={styles.title}>Here is the request we prepared</Text>
        <Text style={styles.subtitle}>
          Please review the details before continuing.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <SummaryRow
          icon={<TagIcon size={16} color={colors.primary[700]} />}
          label="Service needed"
          value={formatVoiceCategory(draft.serviceCategory)}
          isMuted={!draft.serviceCategory}
        />
        <SummaryRow
          icon={<EditIcon size={16} color={colors.primary[700]} />}
          label="Problem summary"
          value={draft.summary.trim() || 'Add a short summary'}
          isMuted={!draft.summary.trim()}
        />
        <SummaryRow
          icon={<CalendarIcon size={16} color={colors.primary[700]} />}
          label="Preferred time"
          value={formatVoiceDraftSchedule(draft.preferredDate, draft.startTime, draft.endTime)}
          isMuted={!draft.preferredDate || !draft.startTime || !draft.endTime}
        />
        <SummaryRow
          icon={<TagIcon size={16} color={colors.primary[700]} />}
          label="Budget"
          value={formatVoiceBudget(draft.budgetRange)}
          isMuted={!draft.budgetRange}
        />
        <SummaryRow
          icon={<MapPinIcon size={16} color={colors.primary[700]} />}
          label="Service location"
          value={
            draft.requestLocation
              ? formatVoiceLocation(draft.requestLocation)
              : draft.locationHint
                ? `Heard: ${draft.locationHint}`
                : formatVoiceLocation(draft.requestLocation)
          }
          isMuted={!draft.requestLocation}
        />

        {hasNotes ? (
          <SummaryRow
            icon={<EditIcon size={16} color={colors.primary[700]} />}
            label="Additional note"
            value={draft.notes.trim()}
          />
        ) : null}

        {priorityLabel ? (
          <SummaryRow
            icon={<CheckCircleIcon size={16} color={colors.primary[700]} />}
            label="Priority"
            value={priorityLabel}
          />
        ) : null}
      </View>

      <View style={styles.transcriptCard}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={() => setShowSpokenWords((current) => !current)}
          style={styles.transcriptToggle}
        >
          <Text style={styles.transcriptLabel}>What you said</Text>
          {showSpokenWords ? (
            <ChevronDownIcon size={16} color={colors.neutral[500]} />
          ) : (
            <ChevronRightIcon size={16} color={colors.neutral[500]} />
          )}
        </TouchableOpacity>

        {showSpokenWords ? (
          <Text style={styles.transcriptText}>
            "{draft.spokenRequest.trim() || 'No spoken request was captured.'}"
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
  headerCard: {
    backgroundColor: 'rgba(255,253,249,0.98)',
    borderRadius: 28,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.successLight,
  },
  badgeText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.primary[800],
    fontWeight: typography.weight.semibold,
  },
  title: {
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
  },
  subtitle: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.neutral[700],
  },
  summaryCard: {
    backgroundColor: 'rgba(255,253,249,0.98)',
    borderRadius: 28,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing.base,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  rowCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  rowLabel: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral[500],
    fontWeight: typography.weight.semibold,
  },
  rowValue: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.primary[900],
  },
  rowValueMuted: {
    color: colors.neutral[500],
  },
  transcriptCard: {
    backgroundColor: 'rgba(255,253,249,0.72)',
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  transcriptToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  transcriptLabel: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral[600],
    fontWeight: typography.weight.semibold,
  },
  transcriptText: {
    marginTop: spacing.md,
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.neutral[700],
    fontStyle: 'italic',
  },
});
