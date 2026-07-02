import { appEnvironment } from '../../config/appEnvironment';
import { getBackendAuthToken } from '../auth';
import { fetchWithTimeout, joinUrl, parseJsonResponse } from '../shared/http';
import { ProfileService } from './profileService';

type PhotoResponse = {
  photoUrl?: string;
  user?: {
    photoUrl?: string;
  };
};

function requireBackendBaseUrl() {
  if (!appEnvironment.appApiBaseUrl) {
    throw new Error('Backend API URL is not configured. Set EXPO_PUBLIC_APP_API_BASE_URL.');
  }

  return appEnvironment.appApiBaseUrl;
}

async function requireToken() {
  const token = await getBackendAuthToken();
  if (!token) {
    throw new Error('Please log in again before updating your profile photo.');
  }

  return token;
}

function getFilename(uri: string) {
  const lastSegment = uri.split('/').pop() || 'profile-photo.jpg';
  return lastSegment.includes('.') ? lastSegment : `${lastSegment}.jpg`;
}

function getMimeType(filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return 'image/jpeg';
}

export const backendProfileService: ProfileService = {
  async getAvatar() {
    return null;
  },

  async saveAvatar(_userId: string, uri: string) {
    const token = await requireToken();
    const filename = getFilename(uri);
    const formData = new FormData();

    formData.append('photo', {
      uri,
      name: filename,
      type: getMimeType(filename),
    } as unknown as Blob);

    const response = await fetchWithTimeout(joinUrl(requireBackendBaseUrl(), '/profile/photo'), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const payload = await parseJsonResponse<PhotoResponse>(
      response,
      'Profile photo upload failed.'
    );

    return payload.photoUrl || payload.user?.photoUrl || null;
  },
};
