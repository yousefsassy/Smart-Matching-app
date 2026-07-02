import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { SERVICE_CATEGORY_OPTIONS } from '../../constants/serviceCategories';
import LocationPicker from '../LocationPicker';
import { MapPinIcon, BriefcaseIcon } from '../Icons';
import { ServiceCategory } from '../../types/serviceRequest';
import { ProviderServiceCoverage } from '../../types/provider';

export interface LocationData {
  serviceCoverage: ProviderServiceCoverage;
  serviceCategories: ServiceCategory[];
}

interface LocationStepProps {
  data: LocationData;
  errors: Record<string, string>;
  onChange: (
    field: string,
    value: ProviderServiceCoverage | ServiceCategory[]
  ) => void;
  onOpenLocationPicker: () => void;
}

export default function LocationStep({
  data,
  errors,
  onChange,
  onOpenLocationPicker,
}: LocationStepProps) {
  const toggleCategory = (category: ServiceCategory) => {
    const current = data.serviceCategories;
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onChange('serviceCategories', updated);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <BriefcaseIcon size={22} color={colors.primary[500]} />
        </View>
        <View>
          <Text style={styles.title}>Professional Details</Text>
          <Text style={styles.subtitle}>Your location and services</Text>
        </View>
      </View>

      {/* City / Governorate */}
      <View style={styles.section}>
        <View style={styles.fieldLabelRow}>
          <MapPinIcon size={16} color={colors.neutral[500]} />
          <Text style={styles.fieldLabel}>Base Service Location</Text>
        </View>
        <LocationPicker
          value={data.serviceCoverage.baseLocation}
          onPress={onOpenLocationPicker}
          error={errors.serviceCoverage}
        />
        <Text style={styles.fieldHint}>
          This exact location is kept for future distance-based smart matching.
        </Text>
        <Text style={styles.radiusHint}>
          Service radius support is reserved in the data model and can be added later without changing this picker.
        </Text>
      </View>

      {/* Service Categories */}
      <View style={styles.section}>
        <Text style={styles.fieldLabel}>Service Categories</Text>
        <Text style={styles.fieldHint}>Select all that apply (optional)</Text>
        <View style={styles.chipsGrid}>
          {SERVICE_CATEGORY_OPTIONS.map((cat) => {
            const selected = data.serviceCategories.includes(cat.value);
            return (
              <TouchableOpacity
                key={cat.value}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggleCategory(cat.value)}
                activeOpacity={0.8}
              >
                <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
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
    marginBottom: spacing.xl,
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
  section: {
    marginBottom: spacing.lg,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  fieldHint: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  radiusHint: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    lineHeight: 18,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
  },
  chipSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[600],
  },
  chipLabelSelected: {
    color: colors.primary[700],
  },
});
