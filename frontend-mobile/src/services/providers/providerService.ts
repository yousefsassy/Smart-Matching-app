import { NormalizedLocation } from '../../types/location';
import { ProviderRanking, ServiceCategory, TimeSlot } from '../../types/serviceRequest';

export interface ProviderMatchQuery {
  serviceCategory: ServiceCategory;
  requestLocation: NormalizedLocation;
  timeSlot: TimeSlot;
}

export interface ProviderService {
  getRankedProviders: (query: ProviderMatchQuery) => Promise<ProviderRanking[]>;
}
