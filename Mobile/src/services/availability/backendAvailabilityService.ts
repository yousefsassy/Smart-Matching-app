import { appEnvironment } from '../../config/appEnvironment';
import { getBackendAuthToken } from '../auth';
import { fetchWithTimeout, joinUrl, parseJsonResponse } from '../shared/http';
import { AvailabilityService, AvailabilityState } from './availabilityService';

function requireBackendBaseUrl() {
  if (!appEnvironment.appApiBaseUrl) {
    throw new Error('Backend API URL is not configured. Set EXPO_PUBLIC_APP_API_BASE_URL.');
  }

  return appEnvironment.appApiBaseUrl;
}

async function requireToken() {
  const token = await getBackendAuthToken();
  if (!token) {
    throw new Error('Please log in again before updating availability.');
  }

  return token;
}

async function availabilityRequest<T>(path: string, init: RequestInit = {}) {
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

  return parseJsonResponse<T>(response, 'Availability request failed.');
}

export const backendAvailabilityService: AvailabilityService = {
  getMe() {
    return availabilityRequest<AvailabilityState>('/availability/me');
  },

  toggleOnline(isAvailable: boolean) {
    return availabilityRequest<AvailabilityState>('/availability/toggle-online', {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    });
  },

  syncDay(payload) {
    return availabilityRequest<AvailabilityState>('/availability/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteDay(date: string) {
    return availabilityRequest<AvailabilityState>(`/availability/${date}`, {
      method: 'DELETE',
    });
  },
};

