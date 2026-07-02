import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DatePickerField from '../../../components/DatePickerField';
import Input from '../../../components/Input';
import PrimaryButton from '../../../components/PrimaryButton';
import Textarea from '../../../components/Textarea';
import { CalendarIcon, ClockIcon, MapPinIcon } from '../../../components/Icons';
import { SERVICE_CATEGORY_OPTIONS } from '../../../constants/serviceCategories';
import { BudgetRange } from '../../../types/serviceRequest';
import { borderRadius, colors, spacing, typography } from '../../../theme';
import { VoiceDraftIssue, VoiceRequestDraft } from '../types/voice';
import { formatVoiceBudget, formatVoiceLocation } from '../utils/voiceFormatting';

interface VoiceRequestEditSheetProps {
  draft: VoiceRequestDraft;
  issues: VoiceDraftIssue[];
  onChange: (nextDraft: VoiceRequestDraft) => void;
  onOpenLocationPicker: () => void;
  onDone: () => void;
}

type PickerTarget = 'startTime' | 'endTime' | null;

function formatTimeValue(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function timeValueToDate(value: string | null) {
  const date = new Date();
  const [hours = 9, minutes = 0] = (value ?? '09:00').split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function parseBudgetValue(value: string) {
  const digitsOnly = value.replace(/[^\d]/g, '');
  if (!digitsOnly) {
    return null;
  }

  const parsed = Number(digitsOnly);
  return Number.isFinite(parsed) ? parsed : null;
}

function TimeField({
  label,
  value,
  onPress,
  hasIssue,
}: {
  label: string;
  value: string | null;
  onPress: () => void;
  hasIssue: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.84}
      onPress={onPress}
      style={[styles.timeField, hasIssue && styles.fieldIssue]}
    >
      <View style={styles.timeFieldIcon}>
        <ClockIcon size={16} color={colors.primary[600]} />
      </View>
      <View style={styles.timeFieldCopy}>
        <Text style={styles.timeFieldLabel}>{label}</Text>
        <Text style={[styles.timeFieldValue, !value && styles.placeholderText]}>
          {value || 'Choose time'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function VoiceRequestEditSheet({
  draft,
  issues,
  onChange,
  onOpenLocationPicker,
  onDone,
}: VoiceRequestEditSheetProps) {
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const issueFields = useMemo(() => new Set(issues.map((issue) => issue.field)), [issues]);

  const updateDraft = <K extends keyof VoiceRequestDraft>(field: K, value: VoiceRequestDraft[K]) => {
    onChange({
      ...draft,
      [field]: value,
    });
  };

  const updateBudgetValue = (field: 'min' | 'max', value: string) => {
    const numericValue = parseBudgetValue(value);
    if (numericValue === null) {
      updateDraft('budgetRange', null);
      return;
    }

    const nextBudget: BudgetRange = {
      min: field === 'min' ? numericValue : draft.budgetRange?.min ?? numericValue,
      max: field === 'max' ? numericValue : draft.budgetRange?.max ?? numericValue,
      currency: draft.budgetRange?.currency ?? 'TND',
    };

    updateDraft('budgetRange', {
      min: Math.min(nextBudget.min, nextBudget.max),
      max: Math.max(nextBudget.min, nextBudget.max),
      currency: nextBudget.currency,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Adjust the details</Text>
        <Text style={styles.subtitle}>
          Make any changes you need, then return to the review.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Service needed</Text>
        <View style={styles.categoryGrid}>
          {SERVICE_CATEGORY_OPTIONS.map((category) => {
            const isSelected = draft.serviceCategory === category.value;
            return (
              <TouchableOpacity
                key={category.value}
                accessibilityRole="button"
                activeOpacity={0.84}
                onPress={() => updateDraft('serviceCategory', category.value)}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                  issueFields.has('serviceCategory') && !isSelected ? styles.categoryChipIssue : null,
                ]}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Textarea
        label="Problem summary"
        value={draft.summary}
        onChangeText={(text) => updateDraft('summary', text)}
        placeholder="Describe the issue clearly"
        minHeight={96}
        error={issueFields.has('summary') ? 'Please add a short summary.' : undefined}
      />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Preferred day</Text>
        <DatePickerField
          value={draft.preferredDate}
          onChange={(date) => updateDraft('preferredDate', date)}
          error={issueFields.has('preferredDate') ? 'Please choose a day.' : undefined}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Preferred time</Text>
        <View style={styles.timeRow}>
          <TimeField
            label="From"
            value={draft.startTime}
            onPress={() => setPickerTarget('startTime')}
            hasIssue={issueFields.has('preferredTime')}
          />
          <TimeField
            label="To"
            value={draft.endTime}
            onPress={() => setPickerTarget('endTime')}
            hasIssue={issueFields.has('preferredTime')}
          />
        </View>
        {issueFields.has('preferredTime') ? (
          <Text style={styles.errorText}>Please choose a valid time range.</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Budget</Text>
        <View style={styles.budgetRow}>
          <Input
            label="Min"
            value={draft.budgetRange?.min ? String(draft.budgetRange.min) : ''}
            onChangeText={(text) => updateBudgetValue('min', text)}
            placeholder="200"
            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
            containerStyle={styles.budgetInput}
          />
          <Input
            label="Max"
            value={draft.budgetRange?.max ? String(draft.budgetRange.max) : ''}
            onChangeText={(text) => updateBudgetValue('max', text)}
            placeholder="300"
            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
            containerStyle={styles.budgetInput}
          />
        </View>
        <Text style={styles.budgetHint}>{formatVoiceBudget(draft.budgetRange)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Service location</Text>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={onOpenLocationPicker}
          style={[styles.locationButton, issueFields.has('requestLocation') && styles.fieldIssue]}
        >
          <View style={styles.locationIcon}>
            <MapPinIcon size={16} color={colors.primary[600]} />
          </View>
          <View style={styles.locationCopy}>
            <Text style={styles.locationLabel}>Location</Text>
            <Text style={[styles.locationValue, !draft.requestLocation && styles.placeholderText]}>
              {draft.requestLocation
                ? formatVoiceLocation(draft.requestLocation)
                : draft.locationHint
                  ? `Heard: ${draft.locationHint}`
                  : formatVoiceLocation(draft.requestLocation)}
            </Text>
          </View>
        </TouchableOpacity>
        {issueFields.has('requestLocation') ? (
          <Text style={styles.errorText}>Please add the service location.</Text>
        ) : null}
      </View>

      <Textarea
        label="Additional note"
        value={draft.notes}
        onChangeText={(text) => updateDraft('notes', text)}
        placeholder="Optional"
        minHeight={88}
      />

      <PrimaryButton
        title="Back to review"
        onPress={onDone}
        variant="primary"
        style={styles.fullWidth}
      />

      <DateTimePickerModal
        isVisible={pickerTarget !== null}
        mode="time"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        date={pickerTarget === 'startTime' ? timeValueToDate(draft.startTime) : timeValueToDate(draft.endTime)}
        is24Hour
        locale={Platform.OS === 'ios' ? 'en_GB' : undefined}
        minuteInterval={1}
        onConfirm={(date) => {
          const nextValue = formatTimeValue(date);
          if (pickerTarget === 'startTime') {
            updateDraft('startTime', nextValue);
          }
          if (pickerTarget === 'endTime') {
            updateDraft('endTime', nextValue);
          }
          setPickerTarget(null);
        }}
        onCancel={() => setPickerTarget(null)}
        buttonTextColorIOS={colors.primary[600]}
        accentColor={colors.primary[500]}
        themeVariant="light"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,253,249,0.98)',
    borderRadius: 28,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.neutral[700],
  },
  section: {
    marginBottom: spacing.base,
  },
  sectionLabel: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral[700],
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  categoryChipSelected: {
    backgroundColor: colors.primary[900],
    borderColor: colors.primary[900],
  },
  categoryChipIssue: {
    borderColor: colors.accent.amber,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.primary[800],
    fontWeight: typography.weight.semibold,
  },
  categoryTextSelected: {
    color: colors.neutral[0],
  },
  budgetChip: {
    minWidth: '48%',
  },
  budgetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  budgetInput: {
    flex: 1,
    marginBottom: 0,
  },
  budgetHint: {
    marginTop: spacing.xs,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
    color: colors.neutral[600],
  },
  timeRow: {
    gap: spacing.sm,
  },
  timeField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.surface.base,
  },
  timeFieldIcon: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeFieldCopy: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  timeFieldLabel: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.neutral[500],
    fontWeight: typography.weight.semibold,
    marginBottom: 2,
  },
  timeFieldValue: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.primary[900],
    fontWeight: typography.weight.semibold,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 60,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.surface.base,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCopy: {
    flex: 1,
    gap: 2,
  },
  locationLabel: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.neutral[500],
    fontWeight: typography.weight.semibold,
  },
  locationValue: {
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.base,
    color: colors.primary[900],
  },
  placeholderText: {
    color: colors.neutral[500],
  },
  fieldIssue: {
    borderColor: colors.accent.amber,
  },
  errorText: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.accent.coral,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  fullWidth: {
    width: '100%',
    marginTop: spacing.sm,
  },
});
