import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { colors, typography, spacing, borderRadius } from '../../theme';
import DatePickerField from '../DatePickerField';
import { CalendarIcon, ClockIcon } from '../Icons';

export type TimeValue = string;

export function normalizeTimeValue(value: string | null | undefined): TimeValue | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(/^(\d{1,2})(?::(\d{1,2}))?$/);
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minutes = Number(match[2] ?? '0');

  if (!Number.isInteger(hour) || !Number.isInteger(minutes)) {
    return null;
  }

  if (hour < 0 || hour > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatTimeValue(date: Date): TimeValue {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function timeValueToDate(value: TimeValue | null) {
  const normalized = normalizeTimeValue(value);
  const date = new Date();

  if (!normalized) {
    date.setHours(9, 0, 0, 0);
    return date;
  }

  const [hours, minutes] = normalized.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function getTimeLabel(time: TimeValue | null) {
  const normalized = normalizeTimeValue(time);
  return normalized ?? '';
}

export interface ScheduleData {
  date: Date | null;
  startTime: TimeValue | null;
  endTime: TimeValue | null;
}

interface ScheduleStepProps {
  data: ScheduleData;
  errors: Partial<Record<'date' | 'timeSlot', string>>;
  onChange: (field: keyof ScheduleData, value: Date | TimeValue | null) => void;
}

type PickerTarget = 'startTime' | 'endTime' | null;

function TimeField({
  label,
  value,
  placeholder,
  onPress,
}: {
  label: string;
  value: TimeValue | null;
  placeholder: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.timeField} onPress={onPress} activeOpacity={0.84}>
      <View style={styles.timeFieldIcon}>
        <ClockIcon size={16} color={colors.primary[600]} />
      </View>
      <View style={styles.timeFieldCopy}>
        <Text style={styles.timeFieldLabel}>{label}</Text>
        <Text style={[styles.timeFieldValue, !value && styles.timePlaceholder]}>
          {value ? getTimeLabel(value) : placeholder}
        </Text>
      </View>
      <CalendarIcon size={16} color={colors.neutral[400]} />
    </TouchableOpacity>
  );
}

export default function ScheduleStep({ data, errors, onChange }: ScheduleStepProps) {
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  const handleConfirm = (date: Date) => {
    const timeValue = formatTimeValue(date);

    if (pickerTarget === 'startTime') {
      onChange('startTime', timeValue);
      if (data.endTime) {
        const normalizedEnd = normalizeTimeValue(data.endTime);
        if (normalizedEnd && normalizedEnd <= timeValue) {
          onChange('endTime', null);
        }
      }
    }

    if (pickerTarget === 'endTime') {
      onChange('endTime', timeValue);
    }

    setPickerTarget(null);
  };

  const pickerDate =
    pickerTarget === 'startTime'
      ? timeValueToDate(data.startTime)
      : timeValueToDate(data.endTime);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose a time</Text>
        <Text style={styles.subtitle}>
          Use the native time picker to choose exactly when the service should start and end.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Date</Text>
        <DatePickerField
          value={data.date}
          onChange={(date) => onChange('date', date)}
          error={errors.date}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Time range</Text>

        <View style={styles.timeFields}>
          <TimeField
            label="From"
            value={data.startTime}
            placeholder="Choose start time"
            onPress={() => setPickerTarget('startTime')}
          />

          <TimeField
            label="To"
            value={data.endTime}
            placeholder="Choose end time"
            onPress={() => setPickerTarget('endTime')}
          />
        </View>

        {data.startTime && data.endTime ? (
          <View style={styles.selectionSummary}>
            <Text style={styles.selectionSummaryText}>
              {getTimeLabel(data.startTime)} to {getTimeLabel(data.endTime)}
            </Text>
          </View>
        ) : null}

        {errors.timeSlot ? <Text style={styles.error}>{errors.timeSlot}</Text> : null}
      </View>

      <DateTimePickerModal
        isVisible={pickerTarget !== null}
        mode="time"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        date={pickerDate}
        is24Hour
        locale={Platform.OS === 'ios' ? 'en_GB' : undefined}
        minuteInterval={1}
        onConfirm={handleConfirm}
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
    backgroundColor: colors.surface.raised,
    borderRadius: 26,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.role.sectionTitle,
    color: colors.primary[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  timeFields: {
    gap: spacing.sm,
  },
  timeField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 62,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.surface.base,
  },
  timeFieldIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeFieldCopy: {
    flex: 1,
  },
  timeFieldLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[500],
    marginBottom: 2,
  },
  timeFieldValue: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.primary[900],
  },
  timePlaceholder: {
    color: colors.neutral[400],
  },
  selectionSummary: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.tint,
  },
  selectionSummaryText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary[700],
  },
  error: {
    fontSize: typography.size.xs,
    color: colors.error,
    marginTop: spacing.sm,
  },
});
