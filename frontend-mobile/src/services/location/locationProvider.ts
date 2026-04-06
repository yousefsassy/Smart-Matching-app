import { LocationSearchProvider } from '../../types/location';
import { mockTunisiaLocationProvider } from './mockTunisiaProvider';

let activeLocationSearchProvider: LocationSearchProvider = mockTunisiaLocationProvider;

export function getLocationSearchProvider(): LocationSearchProvider {
  return activeLocationSearchProvider;
}

export function setLocationSearchProvider(provider: LocationSearchProvider) {
  activeLocationSearchProvider = provider;
}
