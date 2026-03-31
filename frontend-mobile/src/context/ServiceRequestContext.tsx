import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import {
  ServiceRequest,
  ServiceCategory,
  Location,
  TimeSlot,
  BudgetRange,
  ProviderRanking,
  Review,
} from '../types/serviceRequest';

interface ServiceRequestContextType {
  // State
  requests: ServiceRequest[];
  isLoading: boolean;

  // Client actions
  createServiceRequest: (data: CreateServiceRequestData) => Promise<ServiceRequest>;
  getClientRequests: () => ServiceRequest[];
  trackRequestStatus: (requestId: string) => ServiceRequest | null;
  selectProvider: (requestId: string, providerId: string) => Promise<void>;
  rateProvider: (requestId: string, rating: number, review?: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;

  // Provider actions
  getProviderRequests: () => ServiceRequest[];
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string, reason?: string) => Promise<void>;
  updateRequestStatus: (requestId: string, status: 'completed') => Promise<void>;

  // Common
  getRequestById: (requestId: string) => ServiceRequest | null;
  refresh: () => Promise<void>;
}

interface CreateServiceRequestData {
  serviceCategory: ServiceCategory;
  description: string;
  location: Location;
  timeSlot: TimeSlot;
  budget?: BudgetRange;
}

const ServiceRequestContext = createContext<ServiceRequestContextType | undefined>(undefined);

const STORAGE_KEY = '@smartmatch_requests';

// Mock providers for ranking
const mockProviders: ProviderRanking[] = [
  {
    providerId: '2',
    providerName: 'Firas Saidi',
    businessName: 'Consulting',
    matchScore: 98,
    trustScore: 4.9,
    distance: 2.3,
    averageRating: 4.9,
    totalReviews: 127,
    serviceCategories: ['plumbing', 'electrical'],
    isVerified: true,
    isAvailable: true,
  },
  {
    providerId: '3',
    providerName: 'Michael Roberts',
    businessName: 'Roberts Services',
    matchScore: 95,
    trustScore: 4.8,
    distance: 3.1,
    averageRating: 4.8,
    totalReviews: 89,
    serviceCategories: ['plumbing', 'cleaning'],
    isVerified: true,
    isAvailable: true,
  },
  {
    providerId: '4',
    providerName: 'Emma Williams',
    businessName: 'Williams Home Services',
    matchScore: 92,
    trustScore: 5.0,
    distance: 4.5,
    averageRating: 5.0,
    totalReviews: 56,
    serviceCategories: ['electrical', 'carpentry'],
    isVerified: false,
    isAvailable: true,
  },
];

export function ServiceRequestProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRequests(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRequests = async (updatedRequests: ServiceRequest[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
      setRequests(updatedRequests);
    } catch (error) {
      console.error('Failed to save requests:', error);
      throw new Error('Failed to save request');
    }
  };

  // Simulate AI matching and ranking
  const getRankedProviders = (
    category: ServiceCategory,
    location: Location,
    timeSlot: TimeSlot
  ): ProviderRanking[] => {
    // Filter by service category
    const filtered = mockProviders.filter((p) =>
      p.serviceCategories.includes(category)
    );

    // Sort by match score (in real app, this would be computed)
    return filtered.sort((a, b) => b.matchScore - a.matchScore);
  };

  const createServiceRequest = async (
    data: CreateServiceRequestData
  ): Promise<ServiceRequest> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const rankedProviders = getRankedProviders(
      data.serviceCategory,
      data.location,
      data.timeSlot
    );

    const newRequest: ServiceRequest = {
      id: `req_${Date.now()}`,
      clientId: user.id,
      clientName: user.fullName,
      clientAvatar: user.avatar,
      serviceCategory: data.serviceCategory,
      description: data.description,
      location: data.location,
      timeSlot: data.timeSlot,
      budget: data.budget,
      rankedProviders,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Service request created',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRequests = [newRequest, ...requests];
    await saveRequests(updatedRequests);
    return newRequest;
  };

  const getClientRequests = (): ServiceRequest[] => {
    if (!user) return [];
    return requests.filter((req) => req.clientId === user.id);
  };

  const getProviderRequests = (): ServiceRequest[] => {
    if (!user) return [];
    // Return requests where provider is in ranked list or assigned
    return requests.filter(
      (req) =>
        req.assignedProviderId === user.id ||
        req.rankedProviders?.some((p) => p.providerId === user.id) ||
        req.selectedProviderId === user.id
    );
  };

  const getRequestById = (requestId: string): ServiceRequest | null => {
    return requests.find((req) => req.id === requestId) || null;
  };

  const trackRequestStatus = (requestId: string): ServiceRequest | null => {
    return getRequestById(requestId);
  };

  const selectProvider = async (requestId: string, providerId: string): Promise<void> => {
    const request = getRequestById(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const provider = request.rankedProviders?.find((p) => p.providerId === providerId);
    const updatedRequest: ServiceRequest = {
      ...request,
      selectedProviderId: providerId,
      assignedProviderId: providerId,
      assignedProviderName: provider?.providerName,
      updatedAt: new Date().toISOString(),
    };

    const updatedRequests = requests.map((req) =>
      req.id === requestId ? updatedRequest : req
    );
    await saveRequests(updatedRequests);
  };

  const acceptRequest = async (requestId: string): Promise<void> => {
    const request = getRequestById(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedRequest: ServiceRequest = {
      ...request,
      status: 'accepted',
      assignedProviderId: user?.id,
      assignedProviderName: user?.fullName,
      acceptedAt: new Date().toISOString(),
      statusHistory: [
        ...request.statusHistory,
        {
          status: 'accepted',
          timestamp: new Date().toISOString(),
          note: `Accepted by ${user?.fullName}`,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    const updatedRequests = requests.map((req) =>
      req.id === requestId ? updatedRequest : req
    );
    await saveRequests(updatedRequests);
  };

  const rejectRequest = async (requestId: string, reason?: string): Promise<void> => {
    const request = getRequestById(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedRequest: ServiceRequest = {
      ...request,
      status: 'rejected',
      statusHistory: [
        ...request.statusHistory,
        {
          status: 'rejected',
          timestamp: new Date().toISOString(),
          note: reason || `Rejected by ${user?.fullName}`,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    const updatedRequests = requests.map((req) =>
      req.id === requestId ? updatedRequest : req
    );
    await saveRequests(updatedRequests);
  };

  const updateRequestStatus = async (
    requestId: string,
    status: 'completed'
  ): Promise<void> => {
    const request = getRequestById(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedRequest: ServiceRequest = {
      ...request,
      status,
      ...(status === 'completed' && { completedAt: new Date().toISOString() }),
      statusHistory: [
        ...request.statusHistory,
        {
          status,
          timestamp: new Date().toISOString(),
          note: `Status updated to ${status}`,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    const updatedRequests = requests.map((req) =>
      req.id === requestId ? updatedRequest : req
    );
    await saveRequests(updatedRequests);
  };

  const rateProvider = async (
    requestId: string,
    rating: number,
    review?: string
  ): Promise<void> => {
    const request = getRequestById(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== 'completed') {
      throw new Error('Can only rate completed requests');
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedRequest: ServiceRequest = {
      ...request,
      rating,
      review,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRequests = requests.map((req) =>
      req.id === requestId ? updatedRequest : req
    );
    await saveRequests(updatedRequests);
  };

  const cancelRequest = async (requestId: string): Promise<void> => {
    const request = getRequestById(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedRequest: ServiceRequest = {
      ...request,
      status: 'cancelled',
      statusHistory: [
        ...request.statusHistory,
        {
          status: 'cancelled',
          timestamp: new Date().toISOString(),
          note: 'Cancelled by client',
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    const updatedRequests = requests.map((req) =>
      req.id === requestId ? updatedRequest : req
    );
    await saveRequests(updatedRequests);
  };

  const refresh = async (): Promise<void> => {
    setIsLoading(true);
    await loadRequests();
  };

  return (
    <ServiceRequestContext.Provider
      value={{
        requests,
        isLoading,
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
      }}
    >
      {children}
    </ServiceRequestContext.Provider>
  );
}

export function useServiceRequests() {
  const context = useContext(ServiceRequestContext);
  if (context === undefined) {
    throw new Error('useServiceRequests must be used within a ServiceRequestProvider');
  }
  return context;
}
