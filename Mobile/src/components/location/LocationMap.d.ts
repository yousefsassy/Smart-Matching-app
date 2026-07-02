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

declare const LocationMap: (props: LocationMapProps) => JSX.Element;

export default LocationMap;
