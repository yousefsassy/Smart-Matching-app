import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import LocationPicker from '../LocationPicker';
import { MapPinIcon } from '../Icons';

interface LocationData {
  city: string;
  radius: number;
}

interface LocationStepProps {
  data: LocationData;
  errors: Record<string, string>;
  onChange: (field: string, value: string | number) => void;
}

const MIN_RADIUS = 1;
const MAX_RADIUS = 50;

export default function LocationStep({ data, errors, onChange }: LocationStepProps) {
  const circleSize = 40 + ((data.radius - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS)) * 100;
  const trackWidth = useRef(0);
  const thumbAnim = useRef(new Animated.Value(0)).current;

  const fraction = (data.radius - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        thumbAnim.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (trackWidth.current === 0) return;
        const touchX = evt.nativeEvent.locationX + gestureState.dx;
        const pct = Math.max(0, Math.min(1, touchX / trackWidth.current));
        const newValue = Math.round(MIN_RADIUS + pct * (MAX_RADIUS - MIN_RADIUS));
        onChange('radius', newValue);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MapPinIcon size={22} color={colors.primary[500]} />
        </View>
        <View>
          <Text style={styles.title}>Service Location</Text>
          <Text style={styles.subtitle}>Where will you operate?</Text>
        </View>
      </View>

      {/* City selector */}
      <Text style={styles.fieldLabel}>City / Governorate</Text>
      <LocationPicker
        value={data.city}
        onSelect={(city) => onChange('city', city)}
        error={errors.city}
      />

      {/* Fake map card */}
      <View style={styles.mapCard}>
        <LinearGradient
          colors={[colors.primary[50], colors.accent.cyanLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mapGradient}
        >
          {/* Grid dots for map texture */}
          <View style={styles.gridOverlay}>
            {Array.from({ length: 35 }).map((_, i) => (
              <View key={i} style={styles.gridDot} />
            ))}
          </View>

          {/* Radius circle */}
          <View
            style={[
              styles.radiusCircle,
              {
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
              },
            ]}
          />

          {/* Pin */}
          <View style={styles.pinContainer}>
            <MapPinIcon size={32} color={colors.primary[600]} />
          </View>

          {/* City label */}
          <View style={styles.mapLabel}>
            <Text style={styles.mapLabelText}>
              {data.city || 'Select a city'}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Custom radius slider */}
      <View style={styles.sliderSection}>
        <View style={styles.sliderHeader}>
          <Text style={styles.fieldLabel}>Service Radius</Text>
          <Text style={styles.radiusValue}>
            {data.radius} <Text style={styles.radiusUnit}>km</Text>
          </Text>
        </View>

        <View
          style={styles.sliderTrackContainer}
          onLayout={onTrackLayout}
          {...panResponder.panHandlers}
        >
          {/* Track background */}
          <View style={styles.sliderTrack}>
            {/* Filled portion */}
            <LinearGradient
              colors={colors.gradients.accent as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.sliderFill, { width: `${fraction * 100}%` }]}
            />
          </View>

          {/* Thumb */}
          <View
            style={[
              styles.sliderThumb,
              { left: `${fraction * 100}%` },
            ]}
          >
            <View style={styles.sliderThumbInner} />
          </View>
        </View>

        <View style={styles.sliderLabels}>
          <Text style={styles.sliderMinMax}>1 km</Text>
          <Text style={styles.sliderMinMax}>50 km</Text>
        </View>
      </View>

      <Text style={styles.hint}>
        Clients within this radius will see your services. You can change this later.
      </Text>
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
  fieldLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  // Fake map
  mapCard: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  mapGradient: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignContent: 'space-evenly',
    padding: spacing.lg,
    opacity: 0.3,
  },
  gridDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.primary[300],
  },
  radiusCircle: {
    position: 'absolute',
    backgroundColor: `${colors.primary[500]}15`,
    borderWidth: 2,
    borderColor: `${colors.primary[500]}40`,
    borderStyle: 'dashed',
  },
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  mapLabel: {
    marginTop: spacing.sm,
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    ...shadows.sm,
    zIndex: 1,
  },
  mapLabelText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[700],
  },
  // Custom slider
  sliderSection: {
    marginTop: spacing.xl,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  radiusValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.primary[600],
  },
  radiusUnit: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[400],
  },
  sliderTrackContainer: {
    height: 40,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14, // center the thumb on the position
    borderRadius: 14,
    backgroundColor: colors.neutral[0],
    borderWidth: 3,
    borderColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderThumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sliderMinMax: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
  },
  hint: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    lineHeight: typography.lineHeight.xs * 1.2,
    marginTop: spacing.lg,
  },
});
