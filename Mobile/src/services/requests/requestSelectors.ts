import { ServiceRequest } from '../../types/serviceRequest';

export function sortRequestsByNewest(requests: ServiceRequest[]) {
  return [...requests].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export function getClientRequests(requests: ServiceRequest[], clientId?: string) {
  if (!clientId) {
    return [];
  }

  return requests.filter((request) => request.clientId === clientId);
}

export function getProviderRequests(requests: ServiceRequest[], providerId?: string) {
  if (!providerId) {
    return [];
  }

  return requests.filter(
    (request) =>
      request.assignedProviderId === providerId ||
      request.selectedProviderId === providerId ||
      request.rankedProviders?.some((provider) => provider.providerId === providerId)
  );
}
