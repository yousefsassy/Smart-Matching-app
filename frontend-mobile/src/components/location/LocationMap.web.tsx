import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { NormalizedLocation } from '../../types/location';

interface RegionLike {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface LocationMapProps {
  defaultRegion: RegionLike;
  selectedLocation: NormalizedLocation | null;
  isResolving: boolean;
  showsUserLocation: boolean;
  onMapPress: (coordinate: Coordinate) => void;
  onMarkerDragEnd: (coordinate: Coordinate) => void;
}

export default function LocationMap({
  defaultRegion,
  selectedLocation,
  isResolving,
  showsUserLocation,
}: LocationMapProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.placeholder}>
        <Text style={styles.title}>Map preview is not available on web</Text>
        <Text style={styles.subtitle}>
          Search for an address or use your current location. The mobile app will still show the interactive map.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Default area</Text>
          <Text style={styles.infoValue}>
            {defaultRegion.latitude.toFixed(4)}, {defaultRegion.longitude.toFixed(4)}
          </Text>
        </View>

        {showsUserLocation ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Current location</Text>
            <Text style={styles.infoValue}>Available through the browser location API</Text>
          </View>
        ) : null}

        {selectedLocation ? (
          <View style={styles.selectedCard}>
            <Text style={styles.infoLabel}>Selected location</Text>
            <Text style={styles.selectedAddress}>{selectedLocation.addressLabel}</Text>
            <Text style={styles.infoValue}>
              {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyHint}>
            <Text style={styles.emptyTitle}>Choose an address above</Text>
            <Text style={styles.emptySubtitle}>
              On web, location selection works through search and current location instead of the native map.
            </Text>
          </View>
        )}

        {isResolving ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.neutral[0]} />
            <Text style={styles.loadingText}>Updating address...</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    backgroundColor: colors.neutral[100],
    ...shadows.md,
  },
  placeholder: {
    minHeight: 320,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.base,
    backgroundColor: colors.surface.raised,
  },
  title: {
    ...typography.role.cardTitle,
    color: colors.primary[900],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.base,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.surface.base,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    padding: spacing.base,
    gap: spacing.xs,
  },
  selectedCard: {
    backgroundColor: colors.infoLight,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    gap: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[500],
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: typography.size.sm,
    color: colors.primary[900],
  },
  selectedAddress: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.primary[900],
  },
  emptyHint: {
    backgroundColor: colors.surface.base,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
  },
  emptyTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary[900],
  },
  emptySubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.base,
    color: colors.neutral[600],
  },
  loadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(5, 15, 30, 0.78)',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  loadingText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[0],
  },
});
