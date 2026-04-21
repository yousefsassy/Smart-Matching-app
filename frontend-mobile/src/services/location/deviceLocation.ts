import * as ExpoLocation from 'expo-location';
import { Alert } from 'react-native';
import { GeoSource, NormalizedLocation } from '../../types/location';

export const DEFAULT_TUNISIA_COORDINATES = {
  latitude: 36.8065,
  longitude: 10.1815,
};

function compactAddressParts(parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(', ');
}

function asOptionalString(value?: string | null) {
  return value ?? undefined;
}

export function buildAddressLabel(location: Partial<NormalizedLocation>) {
  return (
    compactAddressParts([location.city, location.region, location.country]) ||
    compactAddressParts([location.region, location.country]) ||
    location.country ||
    `${location.latitude?.toFixed(4)}, ${location.longitude?.toFixed(4)}`
  );
}

export function normalizeLocation(
  partial: Partial<NormalizedLocation> & Pick<NormalizedLocation, 'latitude' | 'longitude'>
): Omit<NormalizedLocation, 'geoSource' | 'lastUpdatedAt'> {
  const normalized = {
    latitude: partial.latitude,
    longitude: partial.longitude,
    city: partial.city,
    region: partial.region,
    country: partial.country,
    placeId: partial.placeId,
  };

  return {
    ...normalized,
    addressLabel: partial.addressLabel || buildAddressLabel(partial),
  };
}

export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number,
  geoSource: GeoSource
): Promise<NormalizedLocation> {
  try {
    const [result] = await ExpoLocation.reverseGeocodeAsync({ latitude, longitude });

    const location = normalizeLocation({
      latitude,
      longitude,
      city: asOptionalString(result?.city || result?.district),
      region: asOptionalString(result?.region || result?.subregion),
      country: asOptionalString(result?.country),
      addressLabel: compactAddressParts([
        asOptionalString(result?.name || result?.street),
        asOptionalString(result?.city || result?.district),
        asOptionalString(result?.region || result?.subregion),
        asOptionalString(result?.country),
      ]),
    });

    return {
      ...location,
      geoSource,
    };
  } catch {
    return {
      latitude,
      longitude,
      addressLabel: `Pinned location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      country: 'Tunisia',
      geoSource,
    };
  }
}

export async function getCurrentDeviceLocation(): Promise<NormalizedLocation | null> {
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    Alert.alert(
      'Location access needed',
      'Allow location access to center the map on your current position. You can still search or place the pin manually.'
    );
    return null;
  }

  const currentPosition = await ExpoLocation.getCurrentPositionAsync({
    accuracy: ExpoLocation.Accuracy.Balanced,
  });

  return reverseGeocodeCoordinates(
    currentPosition.coords.latitude,
    currentPosition.coords.longitude,
    'device'
  );
}
