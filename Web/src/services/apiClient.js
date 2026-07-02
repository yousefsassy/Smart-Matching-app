import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const TOKEN_STORAGE_KEY = 'smartmatch_admin_token';
const ADMIN_STORAGE_KEY = 'smartmatch_admin_user';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getAdminToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAdminSession({ token, admin }) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
}

export function getStoredAdmin() {
  const rawAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!rawAdmin) return null;

  try {
    const admin = JSON.parse(rawAdmin);
    return getAdminToken() ? admin : null;
  } catch {
    clearAdminSession();
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(ADMIN_STORAGE_KEY);
}

api.interceptors.request.use((config) => {
  if (config.withAuth !== false) {
    const token = getAdminToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data;
    const message = payload?.message || payload?.msg || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export async function apiRequest(path, options = {}) {
  const { auth = true, body, method = 'GET', ...config } = options;
  const response = await api.request({
    url: path,
    method,
    data: body,
    withAuth: auth,
    ...config,
  });

  return response.data;
}
