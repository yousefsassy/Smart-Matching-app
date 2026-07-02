import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, MOCK_NETWORK_DELAYS } from '../../constants/appConfig';
import { NormalizedLocation } from '../../types/location';
import { User } from '../../types/auth';
import {
  CreateServiceRequestInput,
  RequestRatingInput,
  ServiceRequest,
  ServiceRequestStatus,
} from '../../types/serviceRequest';
import { mockProviderService } from '../providers';
import { RequestsService } from './requestsService';

interface LegacyLocationShape {
  latitude: number;
  longitude: number;
  address?: string;
  addressLabel?: string;
  city?: string;
  region?: string;
  state?: string;
  country?: string;
  placeId?: string;
  geoSource?: NormalizedLocation['geoSource'];
  lastUpdatedAt?: string;
}

function buildAddressLabel(location: Partial<LegacyLocationShape>) {
  return (
    [location.city, location.region || location.state, location.country]
      .filter(Boolean)
      .join(', ') ||
    location.addressLabel ||
    location.address ||
    'Unknown location'
  );
}

function migrateStoredLocation(location?: LegacyLocationShape): NormalizedLocation {
  return {
    latitude: location?.latitude ?? 36.8065,
    longitude: location?.longitude ?? 10.1815,
    addressLabel: location?.addressLabel || location?.address || buildAddressLabel(location ?? {}),
    city: location?.city,
    region: location?.region || location?.state,
    country: location?.country,
    placeId: location?.placeId,
    geoSource: location?.geoSource,
    lastUpdatedAt: location?.lastUpdatedAt,
  };
}

function migrateStoredRequest(request: ServiceRequest & { location?: LegacyLocationShape }) {
  const requestLocation = request.requestLocation
    ? migrateStoredLocation(request.requestLocation)
    : migrateStoredLocation(request.location);

  const { location, ...rest } = request as ServiceRequest & { location?: LegacyLocationShape };

  return {
    ...rest,
    requestLocation,
  };
}

async function wait(duration: number) {
  await new Promise((resolve) => setTimeout(resolve, duration));
}

async function saveRequests(requests: ServiceRequest[]) {
  await AsyncStorage.setItem(STORAGE_KEYS.requests, JSON.stringify(requests));
  return requests;
}

async function loadPersistedRequests() {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.requests);
  if (!stored) {
    return [];
  }

  const parsedRequests = JSON.parse(stored) as Array<ServiceRequest & { location?: LegacyLocationShape }>;
  const migratedRequests = parsedRequests.map(migrateStoredRequest);

  if (JSON.stringify(parsedRequests) !== JSON.stringify(migratedRequests)) {
    await saveRequests(migratedRequests);
  }

  return migratedRequests;
}

function getRequestOrThrow(requests: ServiceRequest[], requestId: string) {
  const request = requests.find((item) => item.id === requestId);
  if (!request) {
    throw new Error('Request not found');
  }

  return request;
}

function updateRequest(
  requests: ServiceRequest[],
  requestId: string,
  updater: (request: ServiceRequest) => ServiceRequest
) {
  return requests.map((request) => (request.id === requestId ? updater(request) : request));
}

export const mockRequestsService: RequestsService = {
  async loadRequests() {
    return loadPersistedRequests();
  },

  async createServiceRequest(actor: User, input: CreateServiceRequestInput) {
    const requests = await loadPersistedRequests();
    await wait(MOCK_NETWORK_DELAYS.requestCreateMs);

    const rankedProviders = await mockProviderService.getRankedProviders({
      serviceCategory: input.serviceCategory,
      requestLocation: input.requestLocation,
      timeSlot: input.timeSlot,
    });

    const now = new Date().toISOString();
    const newRequest: ServiceRequest = {
      id: `req_${Date.now()}`,
      clientId: actor.id,
      clientName: actor.fullName,
      clientAvatar: actor.avatar,
      serviceCategory: input.serviceCategory,
      description: input.description,
      requestLocation: input.requestLocation,
      timeSlot: input.timeSlot,
      budget: input.budget,
      rankedProviders,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: now,
          note: 'Service request created',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    return saveRequests([newRequest, ...requests]);
  },

  async selectProvider(requestId, providerId) {
    const requests = await loadPersistedRequests();
    const request = getRequestOrThrow(requests, requestId);
    await wait(MOCK_NETWORK_DELAYS.requestMutationMs);

    const provider = request.rankedProviders?.find((item) => item.providerId === providerId);
    const updatedRequests = updateRequest(requests, requestId, (currentRequest) => ({
      ...currentRequest,
      selectedProviderId: providerId,
      assignedProviderId: providerId,
      assignedProviderName: provider?.providerName,
      updatedAt: new Date().toISOString(),
    }));

    return saveRequests(updatedRequests);
  },

  async acceptRequest(requestId, actor) {
    const requests = await loadPersistedRequests();
    getRequestOrThrow(requests, requestId);
    await wait(MOCK_NETWORK_DELAYS.requestMutationMs);

    const now = new Date().toISOString();
    const updatedRequests = updateRequest(requests, requestId, (request) => ({
      ...request,
      status: 'accepted',
      assignedProviderId: actor.id,
      assignedProviderName: actor.fullName,
      acceptedAt: now,
      statusHistory: [
        ...request.statusHistory,
        {
          status: 'accepted',
          timestamp: now,
          note: `Accepted by ${actor.fullName}`,
        },
      ],
      updatedAt: now,
    }));

    return saveRequests(updatedRequests);
  },

  async rejectRequest(requestId, actorName, reason) {
    const requests = await loadPersistedRequests();
    getRequestOrThrow(requests, requestId);
    await wait(MOCK_NETWORK_DELAYS.requestMutationMs);

    const now = new Date().toISOString();
    const updatedRequests = updateRequest(requests, requestId, (request) => ({
      ...request,
      status: 'rejected',
      statusHistory: [
        ...request.statusHistory,
        {
          status: 'rejected',
          timestamp: now,
          note: reason || `Rejected by ${actorName}`,
        },
      ],
      updatedAt: now,
    }));

    return saveRequests(updatedRequests);
  },

  async updateRequestStatus(requestId, status: Extract<ServiceRequestStatus, 'in_progress' | 'completed'>) {
    const requests = await loadPersistedRequests();
    getRequestOrThrow(requests, requestId);
    await wait(MOCK_NETWORK_DELAYS.requestMutationMs);

    const now = new Date().toISOString();
    const updatedRequests = updateRequest(requests, requestId, (request) => ({
      ...request,
      status,
      ...(status === 'completed' ? { completedAt: now } : {}),
      statusHistory: [
        ...request.statusHistory,
        {
          status,
          timestamp: now,
          note: `Status updated to ${status}`,
        },
      ],
      updatedAt: now,
    }));

    return saveRequests(updatedRequests);
  },

  async rateProvider({ requestId, rating, review }: RequestRatingInput) {
    const requests = await loadPersistedRequests();
    const request = getRequestOrThrow(requests, requestId);

    if (request.status !== 'completed') {
      throw new Error('Can only rate completed requests');
    }

    await wait(MOCK_NETWORK_DELAYS.requestMutationMs);

    const now = new Date().toISOString();
    const updatedRequests = updateRequest(requests, requestId, (currentRequest) => ({
      ...currentRequest,
      rating,
      review,
      reviewedAt: now,
      updatedAt: now,
    }));

    return saveRequests(updatedRequests);
  },

  async cancelRequest(requestId) {
    const requests = await loadPersistedRequests();
    getRequestOrThrow(requests, requestId);
    await wait(MOCK_NETWORK_DELAYS.requestMutationMs);

    const now = new Date().toISOString();
    const updatedRequests = updateRequest(requests, requestId, (request) => ({
      ...request,
      status: 'cancelled',
      statusHistory: [
        ...request.statusHistory,
        {
          status: 'cancelled',
          timestamp: now,
          note: 'Cancelled by client',
        },
      ],
      updatedAt: now,
    }));

    return saveRequests(updatedRequests);
  },
};
