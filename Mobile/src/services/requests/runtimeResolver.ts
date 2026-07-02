import { RequestsRuntime, resolveRequestsRuntimeConfig } from '../../config/appEnvironment';

export function resolveRequestsRuntime(): RequestsRuntime {
  return resolveRequestsRuntimeConfig();
}

export function isRequestsRuntime(runtime: RequestsRuntime) {
  return resolveRequestsRuntime() === runtime;
}
