import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { NormalizedLocation } from '../../types/location';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface LocationMapProps {
  defaultRegion: Region;
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
  onMapPress,
  onMarkerDragEnd,
}: LocationMapProps) {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (!selectedLocation || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        latitudeDelta: defaultRegion.latitudeDelta,
        longitudeDelta: defaultRegion.longitudeDelta,
      },
      350
    );
  }, [
    defaultRegion.latitudeDelta,
    defaultRegion.longitudeDelta,
    selectedLocation?.latitude,
    selectedLocation?.longitude,
  ]);

  return (
    <View style={styles.wrapper}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={defaultRegion}
        showsCompass
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={showsUserLocation}
        onPress={(event: any) => onMapPress(event.nativeEvent.coordinate)}
      >
        {selectedLocation ? (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            draggable
            onDragEnd={(event: any) => onMarkerDragEnd(event.nativeEvent.coordinate)}
          />
        ) : null}
      </MapView>

      {!selectedLocation ? (
        <View style={styles.emptyHint}>
          <Text style={styles.emptyTitle}>Tap the map to drop a pin</Text>
          <Text style={styles.emptySubtitle}>
            Search, use your current location, or place the marker manually.
          </Text>
        </View>
      ) : null}

      {isResolving ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.neutral[0]} />
          <Text style={styles.loadingText}>Updating address...</Text>
        </View>
      ) : null}
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
  map: {
    flex: 1,
    minHeight: 320,
  },
  emptyHint: {
    position: 'absolute',
    top: spacing.base,
    left: spacing.base,
    right: spacing.base,
    backgroundColor: 'rgba(5, 15, 30, 0.78)',
    padding: spacing.base,
    borderRadius: borderRadius.lg,
  },
  emptyTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
  emptySubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.82)',
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: spacing.base,
    left: spacing.base,
    right: spacing.base,
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
