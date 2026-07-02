import { appEnvironment } from '../../config/appEnvironment';
import { User } from '../../types/auth';
import { NormalizedLocation } from '../../types/location';
import {
  CreateServiceRequestInput,
  ProviderRanking,
  RequestRatingInput,
  ServiceRequest,
  ServiceRequestStatus,
} from '../../types/serviceRequest';
import { getBackendAuthToken } from '../auth';
import { fetchWithTimeout, joinUrl, parseJsonResponse } from '../shared/http';
import { RequestsService } from './requestsService';
import { sortRequestsByNewest } from './requestSelectors';

type BackendRole = 'client' | 'provider' | 'admin';

type BackendUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  photoUrl?: string;
  role?: BackendRole;
  providerDetails?: {
    fieldOfService?: string;
    skills?: string[];
    trustScore?: number;
    ratingCount?: number;
    completedJobs?: number;
    experienceYears?: number;
    isAvailable?: boolean;
    isVerified?: boolean;
    location?: BackendLocation;
  };
};

type BackendLocation = {
  regionText?: string;
  geo?: {
    type?: string;
    coordinates?: number[];
  } | null;
};

type BackendRequest = {
  _id?: string;
  id?: string;
  client?: BackendUser | string;
  serviceType?: string;
  location?: BackendLocation;
  description?: string;
  date?: string;
  timeWindow?: {
    start?: string;
    end?: string;
  };
  budget?: {
    min?: number;
    max?: number;
  };
  status?: 'pending' | 'matched' | 'assigned' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
};

type BackendMatch = {
  _id?: string;
  id?: string;
  serviceRequest?: BackendRequest | string;
  provider?: BackendUser | string;
  score?: number;
  rank?: number;
  status?: 'pending' | 'selected' | 'accepted' | 'rejected' | 'expired';
  selected?: boolean;
  reasoning?: string;
  distanceKmSnapshot?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

type BackendJob = {
  _id?: string;
  id?: string;
  serviceRequest?: BackendRequest | string;
  match?: BackendMatch | string;
  client?: BackendUser | string;
  provider?: BackendUser | string;
  status?: 'active' | 'completed' | 'cancelled';
  rating?: number | null;
  review?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ProfileResponse = { user: BackendUser };
type CreateRequestResponse = { request: BackendRequest; matches?: BackendMatch[] };
type MatchesResponse = { request: BackendRequest; matches: BackendMatch[] };
type InvitationsResponse = { invitations: BackendMatch[] };
type SelectMatchResponse = { request?: BackendRequest; match?: BackendMatch };
type RespondMatchResponse = { request?: BackendRequest; match?: BackendMatch; job?: BackendJob };
type JobMutationResponse = { request?: BackendRequest; job?: BackendJob };

let lastLoadedRequests: ServiceRequest[] = [];

function requireBackendBaseUrl() {
  if (!appEnvironment.appApiBaseUrl) {
    throw new Error('Backend API URL is not configured. Set EXPO_PUBLIC_APP_API_BASE_URL.');
  }

  return appEnvironment.appApiBaseUrl;
}

async function requireToken() {
  const token = await getBackendAuthToken();
  if (!token) {
    throw new Error('Please log in again before using backend requests.');
  }

  return token;
}

async function backendRequest<T>(path: string, init: RequestInit = {}) {
  const token = await requireToken();
  const headers = new Headers(init.headers);

  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetchWithTimeout(joinUrl(requireBackendBaseUrl(), path), {
    ...init,
    headers,
  });

  return parseJsonResponse<T>(response, 'Backend request failed.');
}

function getId(value?: { _id?: string; id?: string } | string | null) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return String(value._id || value.id || '');
}

function getUserName(value?: BackendUser | string | null, fallback = 'Unknown') {
  if (!value || typeof value === 'string') return fallback;
  return value.name || value.email || fallback;
}

function toServiceCategory(value?: string) {
  return (value || 'other') as ServiceRequest['serviceCategory'];
}

function toMobileStatus(
  requestStatus?: BackendRequest['status'],
  jobStatus?: BackendJob['status'],
): ServiceRequestStatus {
  if (jobStatus === 'completed' || requestStatus === 'completed') return 'completed';
  if (jobStatus === 'active' || requestStatus === 'assigned') return 'accepted';
  if (requestStatus === 'cancelled' || jobStatus === 'cancelled') return 'cancelled';
  return 'pending';
}

function toLocation(location?: BackendLocation): NormalizedLocation {
  const coordinates = location?.geo?.coordinates;
  const longitude = Array.isArray(coordinates) ? coordinates[0] : undefined;
  const latitude = Array.isArray(coordinates) ? coordinates[1] : undefined;

  return {
    latitude: Number.isFinite(latitude) ? Number(latitude) : 36.8065,
    longitude: Number.isFinite(longitude) ? Number(longitude) : 10.1815,
    addressLabel: location?.regionText || 'Unknown location',
    region: location?.regionText || undefined,
    country: 'Tunisia',
    geoSource: 'search',
  };
}

function toBackendLocation(location: NormalizedLocation) {
  return {
    regionText: location.region || location.city || location.addressLabel,
    geo: {
      type: 'Point',
      coordinates: [location.longitude, location.latitude],
    },
  };
}

function buildStatusHistory(request: BackendRequest, status: ServiceRequestStatus) {
  const createdAt = request.createdAt || new Date().toISOString();
  const updatedAt = request.updatedAt || createdAt;
  const history: ServiceRequest['statusHistory'] = [
    {
      status: 'pending',
      timestamp: createdAt,
      note: 'Service request created',
    },
  ];

  if (status !== 'pending') {
    history.push({
      status,
      timestamp: updatedAt,
      note: `Status updated to ${status}`,
    });
  }

  return history;
}

function normalizeMatch(match: BackendMatch): ProviderRanking | null {
  const provider = typeof match.provider === 'object' ? match.provider : null;
  const providerId = getId(match.provider);
  if (!providerId) return null;

  const providerDetails = provider?.providerDetails;
  const trustScore = Number(providerDetails?.trustScore || 0);
  const ratingCount = Number(providerDetails?.ratingCount || 0);
  const fieldOfService = providerDetails?.fieldOfService;

  return {
    providerId,
    matchId: getId(match),
    providerName: getUserName(provider, 'Provider'),
    businessName: fieldOfService ? `${fieldOfService} provider` : undefined,
    avatar: provider?.photoUrl || undefined,
    matchScore: Math.round(Number(match.score || 0)),
    trustScore,
    distance: Number(match.distanceKmSnapshot || 0),
    averageRating: trustScore,
    totalReviews: ratingCount,
    serviceCategories: fieldOfService ? [fieldOfService] : providerDetails?.skills || [],
    isVerified: Boolean(providerDetails?.isVerified),
    isAvailable: providerDetails?.isAvailable !== false,
    matchReason: match.reasoning || undefined,
  };
}

function mergeMatches(existing: ProviderRanking[] = [], next: ProviderRanking[] = []) {
  const byProvider = new Map<string, ProviderRanking>();
  for (const provider of existing) byProvider.set(provider.providerId, provider);
  for (const provider of next) byProvider.set(provider.providerId, { ...byProvider.get(provider.providerId), ...provider });
  return Array.from(byProvider.values()).sort((left, right) => right.matchScore - left.matchScore);
}

function normalizeRequest(
  request: BackendRequest,
  actor: User | BackendUser | null,
  matches: BackendMatch[] = [],
  job?: BackendJob | null,
): ServiceRequest {
  const requestId = getId(request);
  const client = typeof request.client === 'object' ? request.client : null;
  const provider = typeof job?.provider === 'object' ? job.provider : null;
  const status = toMobileStatus(request.status, job?.status);
  const rankedProviders = matches.map(normalizeMatch).filter(Boolean) as ProviderRanking[];
  const selectedMatch = matches.find((match) => match.selected || match.status === 'selected' || match.status === 'accepted');
  const selectedProviderId = selectedMatch ? getId(selectedMatch.provider) : undefined;

  return {
    id: requestId,
    jobId: getId(job) || undefined,
    clientId: getId(request.client) || getId(actor),
    clientName: getUserName(client, actor && 'name' in actor ? actor.name || 'Client' : 'Client'),
    clientAvatar: client?.photoUrl || undefined,
    serviceCategory: toServiceCategory(request.serviceType),
    description: request.description || '',
    requestLocation: toLocation(request.location),
    timeSlot: {
      date: request.date || new Date().toISOString(),
      startTime: request.timeWindow?.start || '',
      endTime: request.timeWindow?.end || '',
    },
    budget:
      request.budget?.min != null && request.budget?.max != null
        ? { min: request.budget.min, max: request.budget.max, currency: 'TND' }
        : undefined,
    rankedProviders,
    selectedProviderId,
    assignedProviderId: getId(job?.provider) || selectedProviderId,
    assignedProviderName: getUserName(provider, selectedProviderId ? 'Selected provider' : ''),
    status,
    statusHistory: buildStatusHistory(request, status),
    createdAt: request.createdAt || new Date().toISOString(),
    updatedAt: request.updatedAt || request.createdAt || new Date().toISOString(),
    acceptedAt: status === 'accepted' ? job?.createdAt || request.updatedAt : undefined,
    completedAt: status === 'completed' ? job?.updatedAt || request.updatedAt : undefined,
    rating: job?.rating || undefined,
    review: job?.review || undefined,
    reviewedAt: job?.rating ? job.updatedAt : undefined,
  };
}

function mergeRequestLists(...lists: ServiceRequest[][]) {
  const byId = new Map<string, ServiceRequest>();

  for (const list of lists) {
    for (const request of list) {
      const existing = byId.get(request.id);
      if (!existing) {
        byId.set(request.id, request);
        continue;
      }

      byId.set(request.id, {
        ...existing,
        ...request,
        rankedProviders: mergeMatches(existing.rankedProviders, request.rankedProviders),
        jobId: request.jobId || existing.jobId,
        selectedProviderId: request.selectedProviderId || existing.selectedProviderId,
        assignedProviderId: request.assignedProviderId || existing.assignedProviderId,
        assignedProviderName: request.assignedProviderName || existing.assignedProviderName,
      });
    }
  }

  return sortRequestsByNewest(Array.from(byId.values()));
}

async function loadCurrentProfile() {
  const payload = await backendRequest<ProfileResponse>('/profile/me');
  return payload.user;
}

async function loadClientRequests(profile: BackendUser) {
  const requests = await backendRequest<BackendRequest[]>('/service-requests/my');
  const normalized: ServiceRequest[] = [];

  for (const request of requests) {
    let matches: BackendMatch[] = [];
    try {
      const matchPayload = await backendRequest<MatchesResponse>(`/matches/request/${getId(request)}`);
      matches = matchPayload.matches || [];
    } catch {
      matches = [];
    }

    normalized.push(normalizeRequest(request, profile, matches));
  }

  let jobs: ServiceRequest[] = [];
  try {
    const jobPayload = await backendRequest<BackendJob[]>('/jobs/me');
    jobs = jobPayload
      .map((job) => {
        const request = typeof job.serviceRequest === 'object' ? job.serviceRequest : null;
        const match = typeof job.match === 'object' ? job.match : null;
        return request ? normalizeRequest(request, profile, match ? [match] : [], job) : null;
      })
      .filter(Boolean) as ServiceRequest[];
  } catch {
    jobs = [];
  }

  return mergeRequestLists(normalized, jobs);
}

async function loadProviderRequests(profile: BackendUser) {
  let invitations: ServiceRequest[] = [];
  try {
    const invitationPayload = await backendRequest<InvitationsResponse>('/matches/invitations');
    invitations = (invitationPayload.invitations || [])
      .map((match) => {
        const request = typeof match.serviceRequest === 'object' ? match.serviceRequest : null;
        return request ? normalizeRequest(request, profile, [match]) : null;
      })
      .filter(Boolean) as ServiceRequest[];
  } catch {
    invitations = [];
  }

  let jobs: ServiceRequest[] = [];
  try {
    const jobPayload = await backendRequest<BackendJob[]>('/jobs/me');
    jobs = jobPayload
      .map((job) => {
        const request = typeof job.serviceRequest === 'object' ? job.serviceRequest : null;
        const match = typeof job.match === 'object' ? job.match : null;
        return request ? normalizeRequest(request, profile, match ? [match] : [], job) : null;
      })
      .filter(Boolean) as ServiceRequest[];
  } catch {
    jobs = [];
  }

  return mergeRequestLists(invitations, jobs);
}

async function reloadRequests() {
  const profile = await loadCurrentProfile();
  const requests = profile.role === 'provider'
    ? await loadProviderRequests(profile)
    : await loadClientRequests(profile);

  lastLoadedRequests = requests;
  return requests;
}

function getLoadedRequest(requestId: string) {
  const request = lastLoadedRequests.find((item) => item.id === requestId);
  if (!request) {
    throw new Error('Request not loaded yet. Pull to refresh and try again.');
  }

  return request;
}

function getMatchIdForProvider(request: ServiceRequest, providerId: string) {
  const provider = request.rankedProviders?.find((item) => item.providerId === providerId);
  if (!provider?.matchId) {
    throw new Error('Selected provider match is not available yet. Pull to refresh and try again.');
  }

  return provider.matchId;
}

function getCurrentProviderMatchId(request: ServiceRequest, actor?: User) {
  const provider = request.rankedProviders?.find((item) => item.providerId === actor?.id) || request.rankedProviders?.[0];
  if (!provider?.matchId) {
    throw new Error('Provider invitation is not available yet. Pull to refresh and try again.');
  }

  return provider.matchId;
}

export const backendRequestsService: RequestsService = {
  async loadRequests(): Promise<ServiceRequest[]> {
    return reloadRequests();
  },

  async createServiceRequest(_actor: User, input: CreateServiceRequestInput): Promise<ServiceRequest[]> {
    const budget = input.budget || { min: 0, max: 0, currency: 'TND' };
    const payload = await backendRequest<CreateRequestResponse>('/service-requests', {
      method: 'POST',
      body: JSON.stringify({
        serviceType: input.serviceCategory,
        location: toBackendLocation(input.requestLocation),
        description: input.description,
        date: input.timeSlot.date,
        timeWindow: {
          start: input.timeSlot.startTime,
          end: input.timeSlot.endTime,
        },
        budget: {
          min: budget.min,
          max: budget.max,
        },
      }),
    });

    const profile = await loadCurrentProfile();
    const created = normalizeRequest(payload.request, profile, payload.matches || []);
    const rest = await reloadRequests().catch(() => lastLoadedRequests);
    lastLoadedRequests = mergeRequestLists([created], rest);
    return lastLoadedRequests;
  },

  async selectProvider(requestId: string, providerId: string): Promise<ServiceRequest[]> {
    const request = getLoadedRequest(requestId);
    const matchId = getMatchIdForProvider(request, providerId);

    await backendRequest<SelectMatchResponse>(`/matches/${matchId}/select`, { method: 'POST' });
    return reloadRequests();
  },

  async acceptRequest(requestId: string, actor: User): Promise<ServiceRequest[]> {
    const request = getLoadedRequest(requestId);
    const matchId = getCurrentProviderMatchId(request, actor);

    await backendRequest<RespondMatchResponse>(`/matches/${matchId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action: 'accept' }),
    });

    return reloadRequests();
  },

  async rejectRequest(requestId: string, actorName: string, reason?: string): Promise<ServiceRequest[]> {
    const request = getLoadedRequest(requestId);
    const matchId = getCurrentProviderMatchId(request);

    await backendRequest<RespondMatchResponse>(`/matches/${matchId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action: 'reject', actorName, reason }),
    });

    return reloadRequests();
  },

  async updateRequestStatus(
    requestId: string,
    status: Extract<ServiceRequestStatus, 'in_progress' | 'completed'>
  ): Promise<ServiceRequest[]> {
    const request = getLoadedRequest(requestId);

    if (status === 'completed') {
      if (!request.jobId) {
        throw new Error('Job is not available yet. Pull to refresh and try again.');
      }

      await backendRequest<JobMutationResponse>(`/jobs/${request.jobId}/complete`, { method: 'PATCH' });
      return reloadRequests();
    }

    lastLoadedRequests = lastLoadedRequests.map((item) =>
      item.id === requestId
        ? {
            ...item,
            status: 'in_progress',
            updatedAt: new Date().toISOString(),
            statusHistory: [
              ...item.statusHistory,
              {
                status: 'in_progress',
                timestamp: new Date().toISOString(),
                note: 'Marked in progress locally',
              },
            ],
          }
        : item
    );

    return lastLoadedRequests;
  },

  async rateProvider(input: RequestRatingInput): Promise<ServiceRequest[]> {
    const request = getLoadedRequest(input.requestId);
    if (!request.jobId) {
      throw new Error('Job is not available yet. Pull to refresh and try again.');
    }

    await backendRequest(`/jobs/${request.jobId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating: input.rating, review: input.review || '' }),
    });

    return reloadRequests();
  },

  async cancelRequest(requestId: string): Promise<ServiceRequest[]> {
    const request = getLoadedRequest(requestId);

    if (request.jobId && (request.status === 'accepted' || request.status === 'in_progress')) {
      await backendRequest<JobMutationResponse>(`/jobs/${request.jobId}/cancel`, { method: 'POST' });
    } else {
      await backendRequest(`/service-requests/${requestId}/cancel`, { method: 'PATCH' });
    }

    return reloadRequests();
  },
};
