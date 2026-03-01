import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'client' | 'provider';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  businessName?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

interface SignupData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  businessName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@smartmatch_user';

// Mock user data
const mockUsers: Record<string, User & { password: string }> = {
  'client@demo.com': {
    id: '1',
    fullName: 'Faten',
    email: 'client@demo.com',
    password: 'demo123',
    role: 'client',
    avatar: undefined,
  },
  'provider@demo.com': {
    id: '2',
    fullName: 'Firas Saidi',
    email: 'provider@demo.com',
    password: 'demo123',
    role: 'provider',
    businessName: 'Consulting',
    avatar: undefined,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const normalizedEmail = email.toLowerCase().trim();
    const mockUser = mockUsers[normalizedEmail];

    if (mockUser && mockUser.password === password) {
      const { password: _, ...userData } = mockUser;
      setUser(userData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return;
    }

    // For demo: allow any valid-looking credentials
    if (email.includes('@') && password.length >= 6) {
      const newUser: User = {
        id: Date.now().toString(),
        fullName: email.split('@')[0],
        email: normalizedEmail,
        role: 'client', // Default to client for unknown logins
      };
      setUser(newUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      return;
    }

    throw new Error('Invalid email or password');
  };

  const signup = async (data: SignupData): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const newUser: User = {
      id: Date.now().toString(),
      fullName: data.fullName,
      email: data.email.toLowerCase().trim(),
      role: data.role,
      businessName: data.businessName,
    };

    // Store in mock database
    mockUsers[newUser.email] = {
      ...newUser,
      password: data.password,
    };

    setUser(newUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const updateUser = async (data: Partial<User>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    const updatedUser = {
      ...user,
      ...data,
    };

    setUser(updatedUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

    // Also update the mock users database
    if (mockUsers[user.email]) {
      mockUsers[user.email] = {
        ...mockUsers[user.email],
        ...updatedUser,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}