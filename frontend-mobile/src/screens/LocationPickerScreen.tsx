import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CompositeNavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius } from '../theme';
import { LocationPickerRouteParams } from '../navigation/locationPicker';
import { AuthStackParamList } from '../navigation/AuthStack';
import { HomeStackParamList } from '../navigation/MainTabs';
import { ChevronLeftIcon, MapPinIcon } from '../components/Icons';
import LocationSearchInput from '../components/location/LocationSearchInput';
import LocationMap from '../components/location/LocationMap';
import SelectedLocationPreview from '../components/location/SelectedLocationPreview';
import { LocationSearchSuggestion, NormalizedLocation } from '../types/location';
import { getLocationSearchProvider } from '../services/location/locationProvider';
import {
  DEFAULT_TUNISIA_COORDINATES,
  getCurrentDeviceLocation,
  reverseGeocodeCoordinates,
} from '../services/location/deviceLocation';
import { useLocationSelection } from '../context/LocationSelectionContext';

type LocationPickerRoute = RouteProp<{ LocationPicker: LocationPickerRouteParams }, 'LocationPicker'>;
type LocationPickerNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  NativeStackNavigationProp<AuthStackParamList>
>;

const DEFAULT_REGION = {
  latitude: DEFAULT_TUNISIA_COORDINATES.latitude,
  longitude: DEFAULT_TUNISIA_COORDINATES.longitude,
  latitudeDelta: 1.4,
  longitudeDelta: 1.4,
};

export default function LocationPickerScreen() {
  const navigation = useNavigation<LocationPickerNavigationProp>();
  const route = useRoute<LocationPickerRoute>();
  const insets = useSafeAreaInsets();
  const { setPendingSelection } = useLocationSelection();

  const [query, setQuery] = useState(route.params.initialLocation?.addressLabel || '');
  const [suggestions, setSuggestions] = useState<LocationSearchSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<NormalizedLocation | null>(
    route.params.initialLocation || null
  );
  const [searchOrigin, setSearchOrigin] = useState<'user' | 'selection'>('selection');
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showsUserLocation, setShowsUserLocation] = useState(false);
  const hasPersistedSelectionRef = useRef(false);

  const locationProvider = useMemo(() => getLocationSearchProvider(), []);

  useEffect(() => {
    let isCancelled = false;

    const trimmedQuery = query.trim();
    if (!trimmedQuery || searchOrigin !== 'user') {
      setSuggestions([]);
      setIsSearching(false);
      return undefined;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await locationProvider.search(trimmedQuery);
        if (!isCancelled) {
          setSuggestions(results);
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [locationProvider, query, searchOrigin]);

  const applyLocation = (location: NormalizedLocation) => {
    setSelectedLocation(location);
    setQuery(location.addressLabel);
    setSearchOrigin('selection');
    setSuggestions([]);
  };

  const persistSelection = (location: NormalizedLocation) => {
    const persistedLocation: NormalizedLocation = {
      ...location,
      placeId: location.geoSource === 'map_pin' ? undefined : location.placeId,
      lastUpdatedAt: location.lastUpdatedAt || new Date().toISOString(),
    };

    setPendingSelection(route.params.selectionKey, persistedLocation);
    hasPersistedSelectionRef.current = true;
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (!selectedLocation || hasPersistedSelectionRef.current) {
        return;
      }

      persistSelection(selectedLocation);
    });

    return unsubscribe;
  }, [navigation, selectedLocation]);

  const handleSuggestionSelect = (suggestion: LocationSearchSuggestion) => {
    applyLocation({
      ...suggestion.location,
      geoSource: 'search',
    });
  };

  const handleUseCurrentLocation = async () => {
    try {
      setIsLocating(true);
      const location = await getCurrentDeviceLocation();
      if (location) {
        setShowsUserLocation(true);
        applyLocation(location);
      }
    } finally {
      setIsLocating(false);
    }
  };

  const resolvePinnedLocation = async (latitude: number, longitude: number) => {
    try {
      setIsResolvingLocation(true);
      const location = await reverseGeocodeCoordinates(latitude, longitude, 'map_pin');
      applyLocation({
        ...location,
        placeId: undefined,
      });
    } finally {
      setIsResolvingLocation(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedLocation) return;

    persistSelection(selectedLocation);
    navigation.goBack();
  };

  const isProviderMode = route.params.mode === 'provider';

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[colors.primary[900], colors.primary[700], colors.primary[600]]}
        style={[styles.hero, { paddingTop: insets.top + spacing.base }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeftIcon size={20} color={colors.neutral[0]} />
        </TouchableOpacity>

        <Text style={styles.heroEyebrow}>
          {isProviderMode ? 'PROVIDER SERVICE LOCATION' : 'REQUEST LOCATION'}
        </Text>
        <Text style={styles.heroTitle}>{route.params.title || 'Pick a location on the map'}</Text>
        <Text style={styles.heroSubtitle}>
          Search first, use your current position, or place the pin exactly where you need it.
        </Text>
      </LinearGradient>

      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.base }]}>
        <View style={styles.searchPanel}>
          <LocationSearchInput
            query={query}
            isLoading={isSearching}
            suggestions={suggestions}
            onChangeText={(value) => {
              setSearchOrigin('user');
              setQuery(value);
            }}
            onClear={() => {
              setSearchOrigin('user');
              setQuery('');
              setSuggestions([]);
            }}
            onSelectSuggestion={handleSuggestionSelect}
          />

          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleUseCurrentLocation}
            activeOpacity={0.85}
            disabled={isLocating}
          >
            <View style={styles.currentLocationIcon}>
              <MapPinIcon size={16} color={colors.primary[600]} />
            </View>
            <Text style={styles.currentLocationText}>
              {isLocating ? 'Finding your location…' : 'Use my current location'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mapSection}>
          <LocationMap
            defaultRegion={DEFAULT_REGION}
            selectedLocation={selectedLocation}
            isResolving={isResolvingLocation}
            showsUserLocation={showsUserLocation}
            onMapPress={(coordinate) =>
              resolvePinnedLocation(coordinate.latitude, coordinate.longitude)
            }
            onMarkerDragEnd={(coordinate) =>
              resolvePinnedLocation(coordinate.latitude, coordinate.longitude)
            }
          />
        </View>

        <SelectedLocationPreview
          location={selectedLocation}
          confirmLabel={
            isProviderMode ? 'Confirm service location' : 'Confirm request location'
          }
          isConfirming={isResolvingLocation}
          onConfirm={handleConfirm}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginBottom: spacing.lg,
  },
  heroEyebrow: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.wider,
    color: 'rgba(255,255,255,0.78)',
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
  heroSubtitle: {
    marginTop: spacing.sm,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.base,
    color: 'rgba(255,255,255,0.82)',
  },
  content: {
    flex: 1,
    marginTop: -spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.base,
  },
  searchPanel: {
    gap: spacing.md,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  currentLocationIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary[700],
  },
  mapSection: {
    flex: 1,
    minHeight: 320,
  },
});
