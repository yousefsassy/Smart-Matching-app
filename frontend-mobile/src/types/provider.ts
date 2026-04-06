import { ServiceCategory } from './serviceRequest';
import { NormalizedLocation } from './location';

export interface ProviderTimeRange {
  start: string;
  end: string;
}

export interface ProviderDayAvailability {
  enabled: boolean;
  ranges: ProviderTimeRange[];
}

export type ProviderAvailability = Record<string, ProviderDayAvailability>;

export interface ProviderServiceCoverage {
  baseLocation: NormalizedLocation | null;
  serviceAreaRadiusKm?: number;
}

export interface ProviderProfileData {
  serviceCoverage?: ProviderServiceCoverage;
  serviceCategories?: ServiceCategory[];
  availability?: ProviderAvailability;
}
