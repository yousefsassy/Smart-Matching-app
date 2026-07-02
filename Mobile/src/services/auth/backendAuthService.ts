import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/appConfig';
import { appEnvironment } from '../../config/appEnvironment';
import { LoginCredentials, SignupData, User } from '../../types/auth';
import { NormalizedLocation } from '../../types/location';
import { ProviderAvailability } from '../../types/provider';
import { ServiceCategory } from '../../types/serviceRequest';
import { AuthService } from './authService';
import { fetchWithTimeout, joinUrl, parseJsonResponse } from '../shared/http';

type BackendRole = 'client' | 'provider' | 'admin';

type BackendLocation = {
  regionText?: string;
  geo?: {
    type?: string;
    coordinates?: number[];
  };
};

type BackendUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: BackendRole;
  phone?: string;
  photoUrl?: string;
  clientDetails?: {
    regionText?: string;
  };
  providerDetails?: {
    location?: BackendLocation;
    fieldOfService?: string;
    skills?: string[];
    experienceYears?: number;
    isAvailable?: boolean;
    trustScore?: number;
    ratingCount?: number;
    completedJobs?: number;
    isVerified?: boolean;
    availability?: Array<{
      date?: string;
      slot1?: { start?: string; end?: string } | null;
      slot2?: { start?: string; end?: string } | null;
    }>;
  };
};

type StoredAuthSession = {
  token: string | null;
  user: User | null;
};

type LoginResponse = {
  message?: string;
  token: string;
  role: BackendRole;
};

type RegisterResponse = {
  message?: string;
  user: BackendUser;
};

type ProfileResponse = {
  user: BackendUser;
};

const AUTH_SESSION_KEY = `${STORAGE_KEYS.authSession}:backend`;

function requireBackendBaseUrl() {
  if (!appEnvironment.appApiBaseUrl) {
    throw new Error('Backend API URL is not configured. Set EXPO_PUBLIC_APP_API_BASE_URL.');
  }

  return appEnvironment.appApiBaseUrl;
}

function getRegionFromLocation(location?: BackendLocation | null) {
  return location?.regionText || '';
}

function toNormalizedLocation(location?: BackendLocation | null): NormalizedLocation | null {
  const coordinates = location?.geo?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return null;
  }

  const [longitude, latitude] = coordinates;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    addressLabel: location?.regionText || 'Selected location',
    region: location?.regionText || undefined,
    country: 'Tunisia',
    geoSource: 'search',
  };
}

function normalizeBackendUser(user: BackendUser, fallbackRole?: BackendRole): User {
  const role = user.role || fallbackRole;

  if (role !== 'client' && role !== 'provider') {
    throw new Error('This mobile app supports client and provider accounts only.');
  }

  const providerLocation = user.providerDetails?.location;
  const baseLocation = toNormalizedLocation(providerLocation);

  return {
    id: String(user._id || user.id || ''),
    fullName: user.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    role,
    avatar: user.photoUrl || undefined,
    phone: user.phone || undefined,
    governorate:
      user.clientDetails?.regionText ||
      getRegionFromLocation(providerLocation) ||
      undefined,
    isAvailable: user.providerDetails?.isAvailable,
    availability: user.providerDetails?.availability?.reduce((acc: ProviderAvailability, entry) => {
      if (!entry.date) return acc;
      const date = new Date(entry.date).toISOString().split('T')[0];
      const ranges = [entry.slot1, entry.slot2]
        .filter(Boolean)
        .map((slot) => ({ start: slot!.start || '', end: slot!.end || '' }))
        .filter((slot) => slot.start && slot.end);

      acc[date] = {
        enabled: true,
        ranges,
      };

      return acc;
    }, {}),
    serviceCoverage: baseLocation ? { baseLocation } : undefined,
    serviceCategories: user.providerDetails?.fieldOfService
      ? [user.providerDetails.fieldOfService as ServiceCategory]
      : undefined,
  };
}

function toBackendLocation(location: NormalizedLocation | null | undefined) {
  if (!location) {
    return null;
  }

  return {
    regionText: location.region || location.city || location.addressLabel,
    geo: {
      type: 'Point',
      coordinates: [location.longitude, location.latitude],
    },
  };
}

function buildRegisterPayload(data: SignupData) {
  const optionalSignupData = data as SignupData & { phone?: string; governorate?: string };
  const basePayload = {
    name: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    role: data.role,
    phone: optionalSignupData.phone || '',
  };

  if (data.role === 'client') {
    return {
      ...basePayload,
      clientDetails: {
        regionText: optionalSignupData.governorate || '',
      },
    };
  }

  const baseLocation = data.serviceCoverage?.baseLocation;
  const backendLocation = toBackendLocation(baseLocation);
  const primaryCategory = data.serviceCategories?.[0];

  if (!backendLocation || !primaryCategory) {
    throw new Error('Provider signup requires a service location and at least one category.');
  }

  return {
    ...basePayload,
    providerDetails: {
      location: backendLocation,
      fieldOfService: primaryCategory,
      skills: data.serviceCategories || [],
      experienceYears: 0,
    },
  };
}

async function persistSession(session: StoredAuthSession) {
  await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

async function clearSession() {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
}

export async function getBackendAuthToken() {
  const stored = await AsyncStorage.getItem(AUTH_SESSION_KEY);
  if (!stored) return null;

  try {
    const session = JSON.parse(stored) as StoredAuthSession;
    return session.token || null;
  } catch {
    await clearSession();
    return null;
  }
}

async function backendRequest<T>(path: string, init: RequestInit = {}, token?: string | null) {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetchWithTimeout(joinUrl(requireBackendBaseUrl(), path), {
    ...init,
    headers,
  });

  return parseJsonResponse<T>(response, 'Backend request failed.');
}

async function loadProfile(token: string, fallbackRole?: BackendRole) {
  const payload = await backendRequest<ProfileResponse>('/profile/me', { method: 'GET' }, token);
  return normalizeBackendUser(payload.user, fallbackRole);
}

export const backendAuthService: AuthService = {
  async restoreSession() {
    const stored = await AsyncStorage.getItem(AUTH_SESSION_KEY);
    if (!stored) return null;

    try {
      const session = JSON.parse(stored) as StoredAuthSession;
      if (!session.token) return session.user;

      const user = await loadProfile(session.token, session.user?.role);
      await persistSession({ token: session.token, user });
      return user;
    } catch (error) {
      await clearSession();
      throw error;
    }
  },

  async login(credentials: LoginCredentials) {
    const payload = await backendRequest<LoginResponse>('/user/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      }),
    });

    const user = await loadProfile(payload.token, payload.role);
    await persistSession({ token: payload.token, user });
    return user;
  },

  async signup(data: SignupData) {
    const registerPayload = await backendRequest<RegisterResponse>('/user/register', {
      method: 'POST',
      body: JSON.stringify(buildRegisterPayload(data)),
    });

    if (data.role === 'client') {
      return this.login({ email: data.email, password: data.password });
    }

    const user = normalizeBackendUser(registerPayload.user, data.role);
    await persistSession({ token: null, user: null });
    return user;
  },

  async logout() {
    const token = await getBackendAuthToken();

    if (token) {
      await backendRequest('/user/logout', { method: 'POST' }, token).catch(() => undefined);
    }

    await clearSession();
  },

  async updateUser(currentUser, updates) {
    const token = await getBackendAuthToken();
    if (!token) {
      throw new Error('No authenticated backend session found.');
    }

    const payload: Record<string, unknown> = {};
    if (updates.fullName !== undefined) payload.name = updates.fullName;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.governorate !== undefined) payload.regionText = updates.governorate;

    let nextUser = currentUser;

    if (updates.avatar !== undefined) {
      nextUser = {
        ...nextUser,
        avatar: updates.avatar,
      };
    }

    if (updates.isAvailable !== undefined && currentUser.role === 'provider') {
      const availability = await backendRequest<{ isAvailable: boolean }>('/availability/toggle-online', {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable: updates.isAvailable }),
      }, token);
      nextUser = {
        ...nextUser,
        isAvailable: availability.isAvailable,
      };
    }

    if (Object.keys(payload).length === 0) {
      if (nextUser !== currentUser) {
        await persistSession({ token, user: nextUser });
      }
      return nextUser;
    }

    const response = await backendRequest<ProfileResponse>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, token);

    const user = {
      ...normalizeBackendUser(response.user, currentUser.role),
      isAvailable: nextUser.isAvailable,
    };
    await persistSession({ token, user });
    return user;
  },
};
