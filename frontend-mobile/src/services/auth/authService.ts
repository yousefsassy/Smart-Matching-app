import { LoginCredentials, SignupData, User } from '../../types/auth';

export interface AuthService {
  restoreSession: () => Promise<User | null>;
  login: (credentials: LoginCredentials) => Promise<User>;
  signup: (data: SignupData) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (currentUser: User, updates: Partial<User>) => Promise<User>;
}
