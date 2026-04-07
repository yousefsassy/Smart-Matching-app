import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { MapPinIcon } from '../Icons';
import Textarea from '../Textarea';
import LocationPicker from '../LocationPicker';
import { NormalizedLocation } from '../../types/location';

export interface DescribeJobData {
  description: string;
  requestLocation: NormalizedLocation | null;
}

interface DescribeJobStepProps {
  data: DescribeJobData;
  errors: Partial<Record<keyof DescribeJobData, string>>;
  onChange: (
    field: keyof DescribeJobData,
    value: string | NormalizedLocation | null
  ) => void;
  onOpenLocationPicker: () => void;
}

export default function DescribeJobStep({
  data,
  errors,
  onChange,
  onOpenLocationPicker,
}: DescribeJobStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Describe the job</Text>
        <Text style={styles.subtitle}>A few clear details are enough.</Text>
      </View>

      <Textarea
        label="Description"
        value={data.description}
        onChangeText={(text) => onChange('description', text)}
        placeholder="What needs to be done?"
        maxLength={500}
        showCharCount
        minHeight={120}
        error={errors.description}
      />

      <View style={styles.locationHeader}>
        <MapPinIcon size={16} color={colors.primary[500]} />
        <Text style={styles.locationLabel}>Location</Text>
      </View>

      <LocationPicker
        value={data.requestLocation}
        onPress={onOpenLocationPicker}
        error={errors.requestLocation}
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
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  locationLabel: {
    fontSize: typography.size.sm,
    color: colors.neutral[700],
    fontWeight: typography.weight.semibold,
  },
});
