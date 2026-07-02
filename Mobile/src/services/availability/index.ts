import { isAppBackendConfigured } from '../../config/appEnvironment';
import { backendAvailabilityService } from './backendAvailabilityService';

export { backendAvailabilityService } from './backendAvailabilityService';
export type {
  AvailabilityService,
  AvailabilitySlot,
  AvailabilityState,
  BackendAvailabilityEntry,
} from './availabilityService';

export const availabilityService = isAppBackendConfigured()
  ? backendAvailabilityService
  : null;

