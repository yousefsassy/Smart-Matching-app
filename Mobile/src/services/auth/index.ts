import { isAppBackendConfigured } from '../../config/appEnvironment';
import { backendAuthService } from './backendAuthService';
import { mockAuthService } from './mockAuthService';

export { backendAuthService, getBackendAuthToken } from './backendAuthService';
export { mockAuthService } from './mockAuthService';
export type { AuthService } from './authService';

export const authService = isAppBackendConfigured() ? backendAuthService : mockAuthService;
