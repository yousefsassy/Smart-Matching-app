import { ProviderProfileData } from './provider';

export type UserRole = 'client' | 'provider';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  businessName?: string;
  avatar?: string;
  phone?: string;
  governorate?: string;
  isAvailable?: boolean;
  serviceCoverage?: ProviderProfileData['serviceCoverage'];
  serviceCategories?: ProviderProfileData['serviceCategories'];
  availability?: ProviderProfileData['availability'];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends ProviderProfileData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  businessName?: string;
}
