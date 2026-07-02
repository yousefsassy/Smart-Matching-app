import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { NormalizedLocation } from '../../types/location';
import { MapPinIcon } from '../Icons';
import PrimaryButton from '../PrimaryButton';

interface SelectedLocationPreviewProps {
  location: NormalizedLocation | null;
  confirmLabel: string;
  isConfirming?: boolean;
  onConfirm: () => void;
}

function formatGeoSource(source?: NormalizedLocation['geoSource']) {
  if (source === 'device') return 'Current location';
  if (source === 'search') return 'Search result';
  if (source === 'map_pin') return 'Map pin';
  return 'Selected';
}

export default function SelectedLocationPreview({
  location,
  confirmLabel,
  isConfirming = false,
  onConfirm,
}: SelectedLocationPreviewProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <MapPinIcon size={18} color={colors.primary[600]} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>SELECTED LOCATION</Text>
          <Text style={styles.title}>
            {location ? location.addressLabel : 'No location selected yet'}
          </Text>
        </View>
      </View>

      {location ? (
        <View style={styles.metaGrid}>
          <Text style={styles.metaText}>
            {location.city || 'Unknown city'}
            {location.region ? ` • ${location.region}` : ''}
            {location.country ? ` • ${location.country}` : ''}
          </Text>
          <Text style={styles.metaText}>
            {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </Text>
          <Text style={styles.metaSource}>{formatGeoSource(location.geoSource)}</Text>
        </View>
      ) : (
        <Text style={styles.emptyText}>
          Search above or place the pin on the map to continue.
        </Text>
      )}

      <PrimaryButton
        title={confirmLabel}
        onPress={onConfirm}
        disabled={!location}
        loading={isConfirming}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius['2xl'],
    padding: spacing.base,
    gap: spacing.base,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.wider,
    color: colors.primary[400],
  },
  title: {
    marginTop: spacing.xs,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
  },
  metaGrid: {
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },
  metaSource: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.primary[700],
  },
  emptyText: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },
});
