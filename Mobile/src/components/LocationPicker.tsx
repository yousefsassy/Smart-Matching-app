import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';
import { NormalizedLocation } from '../types/location';
import { ChevronRightIcon, MapPinIcon } from './Icons';

interface LocationPickerProps {
  value: NormalizedLocation | null;
  placeholder?: string;
  error?: string;
  onPress: () => void;
}

export default function LocationPicker({
  value,
  placeholder = 'Choose a location',
  error,
  onPress,
}: LocationPickerProps) {
  return (
    <View>
      <TouchableOpacity
        style={[styles.field, error && styles.fieldError]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.iconWell}>
          <MapPinIcon size={18} color={colors.primary[600]} />
        </View>
        <View style={styles.copyBlock}>
          <Text style={[styles.title, !value && styles.placeholder]}>
            {value?.addressLabel || placeholder}
          </Text>
          <Text style={styles.subtitle}>
            {value
              ? `${value.city || 'Tunisia'}${value.region ? ` • ${value.region}` : ''}`
              : 'Search, use your current location, or place the pin on the map'}
          </Text>
        </View>
        <ChevronRightIcon size={18} color={colors.neutral[400]} />
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    backgroundColor: colors.neutral[0],
    gap: spacing.md,
  },
  fieldError: {
    borderColor: colors.error,
  },
  iconWell: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },
  placeholder: {
    color: colors.neutral[400],
  },
  error: {
    fontSize: typography.size.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
