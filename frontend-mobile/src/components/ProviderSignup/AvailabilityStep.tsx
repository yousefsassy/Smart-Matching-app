import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  ScrollView,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import ToggleSwitch from '../ToggleSwitch';
import { CalendarIcon, PlusIcon, XIcon, ClockIcon, CheckIcon } from '../Icons';

interface TimeRange {
  start: string;
  end: string;
}

interface DayConfig {
  enabled: boolean;
  ranges: TimeRange[];
}

export type AvailabilityData = Record<string, DayConfig>;

interface AvailabilityStepProps {
  data: { availability: AvailabilityData };
  errors: Record<string, string>;
  onChange: (field: string, value: AvailabilityData) => void;
}

const DAYS: { key: string; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

// Generate 30-min intervals from 06:00 to 23:00
const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 23; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 23) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
  }
}

export default function AvailabilityStep({ data, errors, onChange }: AvailabilityStepProps) {
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    dayKey: string;
    rangeIndex: number;
    field: 'start' | 'end';
  } | null>(null);

  const availability = data.availability;

  const updateAvailability = (updated: AvailabilityData) => {
    onChange('availability', updated);
  };

  const toggleDay = (dayKey: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateAvailability({
      ...availability,
      [dayKey]: {
        ...availability[dayKey],
        enabled: !availability[dayKey].enabled,
      },
    });
  };

  const addTimeRange = (dayKey: string) => {
    const dayRanges = availability[dayKey].ranges;
    if (dayRanges.length >= 2) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const lastEnd = dayRanges.length > 0 ? dayRanges[dayRanges.length - 1].end : '09:00';
    // Default new range: start 1 hour after last end
    const lastEndHour = parseInt(lastEnd.split(':')[0], 10);
    const newStart = `${String(Math.min(lastEndHour + 1, 22)).padStart(2, '0')}:00`;
    const newEnd = `${String(Math.min(lastEndHour + 3, 23)).padStart(2, '0')}:00`;

    updateAvailability({
      ...availability,
      [dayKey]: {
        ...availability[dayKey],
        ranges: [...dayRanges, { start: newStart, end: newEnd }],
      },
    });
  };

  const removeTimeRange = (dayKey: string, rangeIndex: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateAvailability({
      ...availability,
      [dayKey]: {
        ...availability[dayKey],
        ranges: availability[dayKey].ranges.filter((_, i) => i !== rangeIndex),
      },
    });
  };

  const openTimePicker = (dayKey: string, rangeIndex: number, field: 'start' | 'end') => {
    setPickerTarget({ dayKey, rangeIndex, field });
    setTimePickerVisible(true);
  };

  const selectTime = (time: string) => {
    if (!pickerTarget) return;
    const { dayKey, rangeIndex, field } = pickerTarget;
    const updatedRanges = [...availability[dayKey].ranges];
    updatedRanges[rangeIndex] = { ...updatedRanges[rangeIndex], [field]: time };

    updateAvailability({
      ...availability,
      [dayKey]: {
        ...availability[dayKey],
        ranges: updatedRanges,
      },
    });
    setTimePickerVisible(false);
    setPickerTarget(null);
  };

  const enabledCount = Object.values(availability).filter((d) => d.enabled).length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <CalendarIcon size={22} color={colors.primary[500]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Weekly Availability</Text>
          <Text style={styles.subtitle}>
            {enabledCount} day{enabledCount !== 1 ? 's' : ''} active
          </Text>
        </View>
      </View>

      {errors.availability && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errors.availability}</Text>
        </View>
      )}

      {DAYS.map((day, dayIndex) => {
        const config = availability[day.key];
        const isLast = dayIndex === DAYS.length - 1;

        return (
          <View
            key={day.key}
            style={[styles.dayRow, !isLast && styles.dayRowBorder]}
          >
            <View style={styles.dayHeader}>
              <ToggleSwitch
                value={config.enabled}
                onValueChange={() => toggleDay(day.key)}
              />
              <Text
                style={[
                  styles.dayLabel,
                  !config.enabled && styles.dayLabelDisabled,
                ]}
              >
                {day.label}
              </Text>
            </View>

            {config.enabled && (
              <View style={styles.rangesContainer}>
                {config.ranges.map((range, rangeIndex) => (
                  <View key={rangeIndex} style={styles.rangeRow}>
                    {/* Start time */}
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => openTimePicker(day.key, rangeIndex, 'start')}
                      activeOpacity={0.7}
                    >
                      <ClockIcon size={14} color={colors.neutral[400]} />
                      <Text style={styles.timeText}>{range.start}</Text>
                    </TouchableOpacity>

                    <Text style={styles.timeSeparator}>to</Text>

                    {/* End time */}
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => openTimePicker(day.key, rangeIndex, 'end')}
                      activeOpacity={0.7}
                    >
                      <ClockIcon size={14} color={colors.neutral[400]} />
                      <Text style={styles.timeText}>{range.end}</Text>
                    </TouchableOpacity>

                    {/* Remove button */}
                    {config.ranges.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeTimeRange(day.key, rangeIndex)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <XIcon size={14} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {/* Add time slot — hidden when at 2-slot limit */}
                {config.ranges.length < 2 && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addTimeRange(day.key)}
                    activeOpacity={0.7}
                  >
                    <PlusIcon size={14} color={colors.primary[600]} />
                    <Text style={styles.addButtonText}>Add time slot</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      })}

      {/* Time picker modal */}
      <Modal visible={timePickerVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setTimePickerVisible(false)}
        >
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setTimePickerVisible(false)}>
                <XIcon size={20} color={colors.neutral[500]} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={TIME_OPTIONS}
              keyExtractor={(item) => item}
              style={styles.pickerList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected =
                  pickerTarget &&
                  availability[pickerTarget.dayKey].ranges[pickerTarget.rangeIndex]?.[
                    pickerTarget.field
                  ] === item;

                return (
                  <TouchableOpacity
                    style={[styles.pickerOption, isSelected && styles.pickerOptionSelected]}
                    onPress={() => selectTime(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        isSelected && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && <CheckIcon size={16} color={colors.primary[600]} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    marginTop: 2,
  },
  errorBanner: {
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  errorText: {
    fontSize: typography.size.sm,
    color: colors.error,
    fontWeight: typography.weight.medium,
  },
  // Day rows
  dayRow: {
    paddingVertical: spacing.base,
  },
  dayRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
    marginLeft: spacing.md,
  },
  dayLabelDisabled: {
    color: colors.neutral[400],
  },
  // Time ranges
  rangesContainer: {
    marginTop: spacing.md,
    marginLeft: 60, // align with day label (toggle width + margin)
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  timeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[700],
  },
  timeSeparator: {
    fontSize: typography.size.sm,
    color: colors.neutral[400],
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.error}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  addButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary[600],
  },
  // Time picker modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  pickerSheet: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 320,
    maxHeight: 400,
    ...shadows.lg,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  pickerTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  pickerList: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: 2,
  },
  pickerOptionSelected: {
    backgroundColor: colors.primary[50],
  },
  pickerOptionText: {
    fontSize: typography.size.base,
    color: colors.neutral[700],
  },
  pickerOptionTextSelected: {
    color: colors.primary[700],
    fontWeight: typography.weight.semibold,
  },
});
