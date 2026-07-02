import { isAppBackendConfigured } from '../../config/appEnvironment';
import { backendProfileService } from './backendProfileService';
import { mockProfileService } from './mockProfileService';

export { backendProfileService } from './backendProfileService';
export { mockProfileService } from './mockProfileService';
export type { ProfileService } from './profileService';

export const profileService = isAppBackendConfigured()
  ? backendProfileService
  : mockProfileService;
