import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import DatePickerField from '../DatePickerField';

export type TimeSlotKey = 'morning' | 'afternoon' | 'evening';

export const TIME_SLOT_RANGES: Record<TimeSlotKey, { startTime: string; endTime: string }> = {
  morning:   { startTime: '07:00', endTime: '12:00' },
  afternoon: { startTime: '12:00', endTime: '17:00' },
  evening:   { startTime: '17:00', endTime: '21:00' },
};

interface TimeSlotConfig {
  key: TimeSlotKey;
  label: string;
  emoji: string;
  range: string;
}

const TIME_SLOTS: TimeSlotConfig[] = [
  { key: 'morning',   label: 'Morning',   emoji: '☀️',  range: '7 AM – 12 PM' },
  { key: 'afternoon', label: 'Afternoon', emoji: '🌤️', range: '12 PM – 5 PM' },
  { key: 'evening',   label: 'Evening',   emoji: '🌙',  range: '5 PM – 9 PM' },
];

export interface ScheduleData {
  date: Date | null;
  timeSlotKey: TimeSlotKey | null;
}

interface ScheduleStepProps {
  data: ScheduleData;
  errors: Partial<Record<'date' | 'timeSlot', string>>;
  onChange: (field: keyof ScheduleData, value: Date | TimeSlotKey | null) => void;
}

function TimeSlotTile({
  config,
  isSelected,
  disabled,
  onPress,
}: {
  config: TimeSlotConfig;
  isSelected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  return (
    <Animated.View style={[styles.tileWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.tile,
          isSelected && styles.tileSelected,
          disabled && styles.tileDisabled,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={disabled ? 1 : 0.9}
        disabled={disabled}
      >
        <Text style={styles.tileEmoji}>{config.emoji}</Text>
        <Text style={[styles.tileLabel, isSelected && styles.tileLabelSelected, disabled && styles.tileLabelDisabled]}>
          {config.label}
        </Text>
        <Text style={[styles.tileRange, isSelected && styles.tileRangeSelected, disabled && styles.tileRangeDisabled]}>
          {config.range}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ScheduleStep({ data, errors, onChange }: ScheduleStepProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📅</Text>
        <Text style={styles.title}>When do you need it?</Text>
        <Text style={styles.subtitle}>Pick a date and time that works for you</Text>
      </View>

      {/* Date picker */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Preferred Date</Text>
        <DatePickerField
          value={data.date}
          onChange={(d) => onChange('date', d)}
          error={errors.date}
        />
      </View>

      {/* Time slot tiles */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Preferred Time</Text>
        <View style={styles.tilesRow}>
          {TIME_SLOTS.map((slot) => (
            <TimeSlotTile
              key={slot.key}
              config={slot}
              isSelected={data.timeSlotKey === slot.key}
              disabled={false}
              onPress={() => onChange('timeSlotKey', slot.key)}
            />
          ))}
        </View>
        {errors.timeSlot ? (
          <Text style={styles.error}>{errors.timeSlot}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tileWrapper: {
    flex: 1,
  },
  tile: {
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
    ...shadows.sm,
  },
  tileSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
    borderWidth: 2,
  },
  tileDisabled: {
    opacity: 0.55,
  },
  tileEmoji: {
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  tileLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[700],
    marginBottom: 2,
  },
  tileLabelSelected: {
    color: colors.primary[700],
  },
  tileLabelDisabled: {
    color: colors.neutral[400],
  },
  tileRange: {
    fontSize: 10,
    color: colors.neutral[400],
    textAlign: 'center',
  },
  tileRangeSelected: {
    color: colors.primary[500],
  },
  tileRangeDisabled: {
    color: colors.neutral[300],
  },
  error: {
    fontSize: typography.size.xs,
    color: colors.error,
    marginTop: spacing.sm,
    marginLeft: spacing.xs,
  },
});
