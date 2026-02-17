import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { colors, typography, spacing, borderRadius } from '../theme';
import { ClockIcon } from './Icons';

interface TimePickerFieldProps {
  value: Date | null;
  onChange: (time: Date) => void;
  placeholder?: string;
  error?: string;
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export default function TimePickerField({
  value,
  onChange,
  placeholder = 'HH:mm',
  error,
}: TimePickerFieldProps) {
  const [visible, setVisible] = useState(false);

  const handleConfirm = (date: Date) => {
    setVisible(false);
    onChange(date);
  };

  const borderColor = error ? colors.error : colors.neutral[200];

  return (
    <>
      <TouchableOpacity
        style={[styles.field, { borderColor }]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.iconLeft}>
          <ClockIcon size={20} color={colors.neutral[400]} />
        </View>
        <Text style={[styles.fieldText, !value && styles.placeholder]}>
          {value ? formatTime(value) : placeholder}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}

      <DateTimePickerModal
        isVisible={visible}
        mode="time"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        date={value || new Date()}
        onConfirm={handleConfirm}
        onCancel={() => setVisible(false)}
        buttonTextColorIOS={colors.primary[600]}
        themeVariant="light"
        minuteInterval={5}
        is24Hour={true}
      />
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[50],
    overflow: 'hidden',
  },
  fieldText: {
    flex: 1,
    fontSize: typography.size.base,
    color: colors.neutral[800],
    paddingVertical: spacing.md + 2,
    paddingRight: spacing.base,
  },
  placeholder: {
    color: colors.neutral[400],
  },
  iconLeft: {
    paddingLeft: spacing.base,
    paddingRight: spacing.sm,
  },
  error: {
    fontSize: typography.size.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
