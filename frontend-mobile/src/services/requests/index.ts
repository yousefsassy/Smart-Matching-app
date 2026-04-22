import { backendRequestsService } from './backendRequestsService';
import { mockRequestsService } from './mockRequestsService';
import { RequestsService } from './requestsService';
import { resolveRequestsRuntime, isRequestsRuntime } from './runtimeResolver';

export { mockRequestsService } from './mockRequestsService';
export { backendRequestsService } from './backendRequestsService';
export { getClientRequests, getProviderRequests, sortRequestsByNewest } from './requestSelectors';
export type { RequestsService } from './requestsService';
export { resolveRequestsRuntime, isRequestsRuntime } from './runtimeResolver';

const requestsServicesByRuntime = {
  backend: backendRequestsService,
  mock: mockRequestsService,
} satisfies Record<string, RequestsService>;

export const requestsService: RequestsService =
  requestsServicesByRuntime[resolveRequestsRuntime()];
