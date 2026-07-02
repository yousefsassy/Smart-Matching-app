import { apiRequest, clearAdminSession, setAdminSession } from './apiClient';

function initialsFromEmail(email) {
  return email
    .split('@')[0]
    .split(/[._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A';
}

export async function loginAdmin({ email, password }) {
  const payload = await apiRequest('/user/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });

  if (payload.role !== 'admin') {
    throw new Error('This account is not an admin account');
  }

  const admin = {
    name: email.split('@')[0],
    email,
    role: payload.role,
    avatar: initialsFromEmail(email),
  };

  setAdminSession({ token: payload.token, admin });
  return admin;
}

export function logoutAdmin() {
  clearAdminSession();
}

