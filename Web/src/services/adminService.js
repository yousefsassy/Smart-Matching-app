import { apiRequest } from './apiClient';

function getUserId(user) {
  return user._id || user.id;
}

function getInitials(name, email) {
  const source = name?.trim() || email?.split('@')[0] || '';
  const parts = source.split(/\s+|[._-]/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  return initials || 'U';
}

function getLocationText(user) {
  return (
    user.providerDetails?.location?.regionText ||
    user.clientDetails?.regionText ||
    user.clientDetails?.addressText ||
    'Not provided'
  );
}

function normalizeClient(user) {
  const id = getUserId(user);
  const fullName = user.name || user.email || 'Unnamed client';

  return {
    id,
    fullName,
    email: user.email || 'No email',
    phone: user.phone || 'No phone',
    location: getLocationText(user),
    joinedAt: user.createdAt || new Date().toISOString(),
    requests: user.clientDetails?.requestsCount || 0,
    status: 'active',
    avatar: getInitials(fullName, user.email),
    raw: user,
  };
}

function normalizeProvider(user) {
  const id = getUserId(user);
  const details = user.providerDetails || {};
  const fullName = user.name || user.email || 'Unnamed provider';
  const serviceCategory = (details.fieldOfService || 'other').toLowerCase();
  const isVerified = Boolean(details.isVerified);

  return {
    id,
    fullName,
    email: user.email || 'No email',
    phone: user.phone || 'No phone',
    businessName: details.businessName || `${fullName}'s Service`,
    serviceCategory,
    rating: Number(details.trustScore || 0),
    reviews: Number(details.ratingCount || 0),
    location: getLocationText(user),
    joinedAt: user.createdAt || new Date().toISOString(),
    status: isVerified ? 'approved' : 'pending',
    avatar: getInitials(fullName, user.email),
    raw: user,
  };
}

function normalizeRequestStatus(requestStatus, jobStatus) {
  if (jobStatus === 'completed' || requestStatus === 'completed') return 'completed';
  if (jobStatus === 'cancelled' || requestStatus === 'cancelled') return 'cancelled';
  if (jobStatus === 'active' || requestStatus === 'assigned') return 'assigned';
  if (requestStatus === 'matched') return 'assigned';
  return 'pending';
}

function normalizeRequest(request, { job = null, match = null } = {}) {
  const id = getUserId(request);
  const client = typeof request.client === 'object' ? request.client : null;
  const provider = typeof job?.provider === 'object'
    ? job.provider
    : typeof match?.provider === 'object'
      ? match.provider
      : null;
  const status = normalizeRequestStatus(request.status, job?.status);
  const serviceCategory = (request.serviceType || 'other').toLowerCase();
  const createdAt = request.createdAt || new Date().toISOString();
  const updatedAt = request.updatedAt || createdAt;
  const statusHistory = ['pending'];

  if (status !== 'pending') statusHistory.push(status);

  return {
    id,
    clientName: client?.name || client?.email || 'Unknown client',
    clientEmail: client?.email || 'No email',
    clientPhone: client?.phone || 'No phone',
    providerName: provider?.name || provider?.email || '',
    providerBusiness: provider?.providerDetails?.fieldOfService
      ? `${provider.providerDetails.fieldOfService} provider`
      : '',
    providerPhone: provider?.phone || 'No phone',
    serviceCategory,
    description: request.description || 'No description provided',
    location: request.location?.regionText || 'Not provided',
    scheduledDate: request.date || createdAt,
    scheduledTime: request.timeWindow?.start && request.timeWindow?.end
      ? `${request.timeWindow.start} – ${request.timeWindow.end}`
      : 'Not scheduled',
    budget: request.budget || null,
    status,
    rating: job?.rating || null,
    commentaire: job?.review || '',
    createdAt,
    updatedAt,
    statusHistory,
    matchScore: match?.score ?? null,
    matchReason: match?.reasoning || '',
    raw: { request, job, match },
  };
}

function mergeRequests(requests, jobs) {
  const byId = new Map(requests.map((request) => [request.id, request]));

  for (const job of jobs) {
    const serviceRequest = typeof job.serviceRequest === 'object' ? job.serviceRequest : null;
    if (!serviceRequest) continue;

    const match = typeof job.match === 'object' ? job.match : null;
    byId.set(getUserId(serviceRequest), normalizeRequest(serviceRequest, { job, match }));
  }

  return Array.from(byId.values()).sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt)
  );
}

export async function getUsers() {
  const payload = await apiRequest('/admin');
  return (payload.users || []).map((user) => ({ ...user, id: getUserId(user) }));
}

export async function getClients() {
  const payload = await apiRequest('/admin/clients');
  return (payload.clients || []).map(normalizeClient);
}

export async function getProviders() {
  const payload = await apiRequest('/admin/providers');
  return (payload.providers || []).map(normalizeProvider);
}

export async function getUser(id) {
  const payload = await apiRequest(`/admin/${id}`);
  return payload.user;
}

export async function approveProvider(id) {
  const payload = await apiRequest(`/admin/provider/${id}/approve`, {
    method: 'PATCH',
  });
  return normalizeProvider(payload.user);
}

export async function rejectProvider(id) {
  const payload = await apiRequest(`/admin/provider/${id}/reject`, {
    method: 'PATCH',
  });
  return normalizeProvider(payload.user);
}

export async function deleteProvider(id) {
  return apiRequest(`/admin/provider/${id}`, {
    method: 'DELETE',
  });
}

export async function getRequests() {
  const [requestsPayload, jobsPayload] = await Promise.all([
    apiRequest('/service-requests'),
    apiRequest('/jobs').catch(() => []),
  ]);

  const requests = (requestsPayload || []).map((request) => normalizeRequest(request));
  return mergeRequests(requests, jobsPayload || []);
}

function buildMonthlyRequestChart(requests) {
  const monthKeys = [];
  const now = new Date();

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    monthKeys.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: date.toLocaleString('en-US', { month: 'short' }),
      requests: 0,
    });
  }

  for (const request of requests) {
    const date = new Date(request.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = monthKeys.find((item) => item.key === key);
    if (bucket) bucket.requests += 1;
  }

  return monthKeys.map(({ month, requests }) => ({ month, requests }));
}

function timeAgo(value) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function buildRecentActivity(requests, providers) {
  const requestActivity = requests.slice(0, 4).map((request) => ({
    id: `request-${request.id}`,
    type: request.status === 'completed' ? 'Request Done' : 'Service Request',
    desc: `${request.clientName} · ${request.serviceCategory} · ${request.status}`,
    time: timeAgo(request.updatedAt || request.createdAt),
    icon: request.status === 'completed' ? '✅' : '📋',
  }));

  const pendingProvider = providers.find((provider) => provider.status === 'pending');
  return pendingProvider
    ? [
        {
          id: `provider-${pendingProvider.id}`,
          type: 'Provider Review',
          desc: `${pendingProvider.fullName} is waiting for approval`,
          time: timeAgo(pendingProvider.joinedAt),
          icon: '⏳',
        },
        ...requestActivity,
      ].slice(0, 5)
    : requestActivity;
}

export async function getDashboardOverview() {
  const [clients, providers, requests] = await Promise.all([
    getClients(),
    getProviders(),
    getRequests(),
  ]);

  const completedCount = requests.filter((request) => request.status === 'completed').length;
  const pendingProviders = providers.filter((provider) => provider.status === 'pending').length;
  const averageMatchScoreValues = requests
    .map((request) => Number(request.matchScore))
    .filter((score) => Number.isFinite(score));
  const averageMatchScore = averageMatchScoreValues.length
    ? Math.round(averageMatchScoreValues.reduce((sum, score) => sum + score, 0) / averageMatchScoreValues.length)
    : 0;

  return {
    clients,
    providers,
    requests,
    chartData: buildMonthlyRequestChart(requests),
    recentActivity: buildRecentActivity(requests, providers),
    metrics: {
      totalUsers: clients.length + providers.length,
      requests: requests.length,
      completionRate: requests.length ? Math.round((completedCount / requests.length) * 100) : 0,
      pendingProviders,
      activeClients: clients.length,
      activeProviders: providers.filter((provider) => provider.status === 'approved').length,
      averageMatchScore,
    },
  };
}

