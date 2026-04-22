import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import {
  requestsService,
  getClientRequests as selectClientRequests,
  getProviderRequests as selectProviderRequests,
} from '../services/requests';
import {
  CreateServiceRequestInput,
  RequestRatingInput,
  ServiceRequest,
} from '../types/serviceRequest';

interface ServiceRequestContextType {
  requests: ServiceRequest[];
  isLoading: boolean;
  error: string | null;
  createServiceRequest: (data: CreateServiceRequestInput) => Promise<ServiceRequest>;
  getClientRequests: () => ServiceRequest[];
  trackRequestStatus: (requestId: string) => ServiceRequest | null;
  selectProvider: (requestId: string, providerId: string) => Promise<void>;
  rateProvider: (requestId: string, rating: number, review?: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  getProviderRequests: () => ServiceRequest[];
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string, reason?: string) => Promise<void>;
  updateRequestStatus: (requestId: string, status: 'in_progress' | 'completed') => Promise<void>;
  getRequestById: (requestId: string) => ServiceRequest | null;
  refresh: () => Promise<void>;
}

const ServiceRequestContext = createContext<ServiceRequestContextType | undefined>(undefined);

export function ServiceRequestProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setError(null);
      const nextRequests = await requestsService.loadRequests();
      setRequests(nextRequests);
    } catch (loadError) {
      console.error('Failed to load requests:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests, user]);

  const handleMutation = useCallback(async (mutation: () => Promise<ServiceRequest[]>) => {
    setError(null);
    const updatedRequests = await mutation();
    setRequests(updatedRequests);
    return updatedRequests;
  }, []);

  const createServiceRequest = useCallback(
    async (data: CreateServiceRequestInput) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updatedRequests = await handleMutation(() =>
        requestsService.createServiceRequest(user, data)
      );

      return updatedRequests[0];
    },
    [handleMutation, user]
  );

  const getRequestById = useCallback(
    (requestId: string) => requests.find((request) => request.id === requestId) || null,
    [requests]
  );

  const getClientRequests = useCallback(
    () => selectClientRequests(requests, user?.id),
    [requests, user?.id]
  );

  const getProviderRequests = useCallback(
    () => selectProviderRequests(requests, user?.id),
    [requests, user?.id]
  );

  const trackRequestStatus = useCallback(
    (requestId: string) => getRequestById(requestId),
    [getRequestById]
  );

  const selectProvider = useCallback(
    async (requestId: string, providerId: string) => {
      await handleMutation(() => requestsService.selectProvider(requestId, providerId));
    },
    [handleMutation]
  );

  const acceptRequest = useCallback(
    async (requestId: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      await handleMutation(() => requestsService.acceptRequest(requestId, user));
    },
    [handleMutation, user]
  );

  const rejectRequest = useCallback(
    async (requestId: string, reason?: string) => {
      await handleMutation(() =>
        requestsService.rejectRequest(requestId, user?.fullName || 'Provider', reason)
      );
    },
    [handleMutation, user?.fullName]
  );

  const updateRequestStatus = useCallback(
    async (requestId: string, status: 'in_progress' | 'completed') => {
      await handleMutation(() => requestsService.updateRequestStatus(requestId, status));
    },
    [handleMutation]
  );

  const rateProvider = useCallback(
    async (requestId: string, rating: number, review?: string) => {
      const payload: RequestRatingInput = { requestId, rating, review };
      await handleMutation(() => requestsService.rateProvider(payload));
    },
    [handleMutation]
  );

  const cancelRequest = useCallback(
    async (requestId: string) => {
      await handleMutation(() => requestsService.cancelRequest(requestId));
    },
    [handleMutation]
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadRequests();
  }, [loadRequests]);

  const value = useMemo<ServiceRequestContextType>(
    () => ({
      requests,
      isLoading,
      error,
      createServiceRequest,
      getClientRequests,
      getProviderRequests,
      trackRequestStatus,
      selectProvider,
      acceptRequest,
      rejectRequest,
      updateRequestStatus,
      rateProvider,
      cancelRequest,
      getRequestById,
      refresh,
    }),
    [
      acceptRequest,
      cancelRequest,
      createServiceRequest,
      error,
      getClientRequests,
      getProviderRequests,
      getRequestById,
      isLoading,
      rateProvider,
      refresh,
      rejectRequest,
      requests,
      selectProvider,
      trackRequestStatus,
      updateRequestStatus,
    ]
  );

  return <ServiceRequestContext.Provider value={value}>{children}</ServiceRequestContext.Provider>;
}

export function useServiceRequests() {
  const context = useContext(ServiceRequestContext);
  if (context === undefined) {
    throw new Error('useServiceRequests must be used within a ServiceRequestProvider');
  }
  return context;
}
