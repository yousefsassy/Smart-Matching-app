import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { MapPinIcon } from '../Icons';
import Textarea from '../Textarea';
import LocationPicker from '../LocationPicker';

export interface DescribeJobData {
  description: string;
  location: string;
}

interface DescribeJobStepProps {
  data: DescribeJobData;
  errors: Partial<Record<keyof DescribeJobData, string>>;
  onChange: (field: keyof DescribeJobData, value: string) => void;
}

export default function DescribeJobStep({ data, errors, onChange }: DescribeJobStepProps) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📝</Text>
        <Text style={styles.title}>Describe your job</Text>
        <Text style={styles.subtitle}>Tell us what's needed and where you are</Text>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Textarea
          label="Job Description *"
          value={data.description}
          onChangeText={(text) => onChange('description', text)}
          placeholder="Describe the problem or what needs to be done — the more detail, the better match you'll get..."
          maxLength={500}
          showCharCount
          minHeight={120}
          error={errors.description}
        />
      </View>

      {/* Location */}
      <View style={styles.section}>
        <View style={styles.sectionLabelRow}>
          <MapPinIcon size={16} color={colors.primary[500]} />
          <Text style={styles.sectionLabel}>Location *</Text>
        </View>
        <LocationPicker
          value={data.location}
          onSelect={(val) => onChange('location', val)}
          error={errors.location}
        />
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
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
});
