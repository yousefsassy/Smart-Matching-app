import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, MOCK_NETWORK_DELAYS } from '../../constants/appConfig';
import { LoginCredentials, SignupData, User } from '../../types/auth';
import { AuthService } from './authService';

type MockUserRecord = User & { password: string };

const mockUsers: Record<string, MockUserRecord> = {
  'client@demo.com': {
    id: '1',
    fullName: 'Faten',
    email: 'client@demo.com',
    password: 'demo123',
    role: 'client',
    avatar: undefined,
    governorate: 'Tunis',
  },
  'provider@demo.com': {
    id: '2',
    fullName: 'Firas Saidi',
    email: 'provider@demo.com',
    password: 'demo123',
    role: 'provider',
    businessName: 'Consulting',
    avatar: undefined,
    governorate: 'Tunis',
    isAvailable: true,
  },
};

async function wait(duration: number) {
  await new Promise((resolve) => setTimeout(resolve, duration));
}

async function persistUserSession(user: User) {
  await AsyncStorage.setItem(STORAGE_KEYS.authSession, JSON.stringify(user));
}

export const mockAuthService: AuthService = {
  async restoreSession() {
    const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.authSession);
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  },

  async login({ email, password }: LoginCredentials) {
    await wait(MOCK_NETWORK_DELAYS.authLoginMs);

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = mockUsers[normalizedEmail];

    if (existingUser && existingUser.password === password) {
      const { password: _, ...user } = existingUser;
      await persistUserSession(user);
      return user;
    }

    if (normalizedEmail.includes('@') && password.length >= 6) {
      const user: User = {
        id: Date.now().toString(),
        fullName: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: 'client',
      };

      await persistUserSession(user);
      return user;
    }

    throw new Error('Invalid email or password');
  },

  async signup(data: SignupData) {
    await wait(MOCK_NETWORK_DELAYS.authSignupMs);

    const user: User = {
      id: Date.now().toString(),
      fullName: data.fullName,
      email: data.email.toLowerCase().trim(),
      role: data.role,
      businessName: data.businessName,
      isAvailable: data.role === 'provider' ? true : undefined,
      serviceCoverage: data.serviceCoverage,
      serviceCategories: data.serviceCategories,
      availability: data.availability,
    };

    mockUsers[user.email] = {
      ...user,
      password: data.password,
    };

    // BACKEND NEEDED: replace local session persistence with a real signup/session API.
    await persistUserSession(user);
    return user;
  },

  async logout() {
    await AsyncStorage.removeItem(STORAGE_KEYS.authSession);
  },

  async updateUser(currentUser, updates) {
    const updatedUser: User = {
      ...currentUser,
      ...updates,
    };

    if (mockUsers[currentUser.email]) {
      mockUsers[currentUser.email] = {
        ...mockUsers[currentUser.email],
        ...updatedUser,
      };
    }

    // BACKEND NEEDED: replace local profile persistence with a profile update API.
    await persistUserSession(updatedUser);
    return updatedUser;
  },
};
