import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { colors, typography, spacing, borderRadius } from '../theme';
import { CalendarIcon } from './Icons';

interface DatePickerFieldProps {
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function DatePickerField({ value, onChange, error }: DatePickerFieldProps) {
  const [visible, setVisible] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
          <CalendarIcon size={20} color={colors.neutral[400]} />
        </View>
        <Text style={[styles.fieldText, !value && styles.placeholder]}>
          {value ? formatDate(value) : 'DD/MM/YYYY'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}

      <DateTimePickerModal
        isVisible={visible}
        mode="date"
        display={Platform.OS === 'ios' ? 'inline' : 'default'}
        date={value || today}
        minimumDate={today}
        onConfirm={handleConfirm}
        onCancel={() => setVisible(false)}
        buttonTextColorIOS={colors.primary[600]}
        accentColor={colors.primary[500]}
        themeVariant="light"
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
