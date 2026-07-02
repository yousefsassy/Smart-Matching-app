export type GeoSource = 'device' | 'search' | 'map_pin';

export interface NormalizedLocation {
  latitude: number;
  longitude: number;
  addressLabel: string;
  city?: string;
  region?: string;
  country?: string;
  placeId?: string;
  geoSource?: GeoSource;
  lastUpdatedAt?: string;
}

export interface LocationSearchSuggestion {
  id: string;
  title: string;
  subtitle?: string;
  location: Omit<NormalizedLocation, 'geoSource' | 'lastUpdatedAt'>;
}

export interface LocationSearchProvider {
  search(query: string): Promise<LocationSearchSuggestion[]>;
}
