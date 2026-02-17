export type ServiceRequestStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type ServiceCategory =
  | 'plumbing'
  | 'electrical'
  | 'cleaning'
  | 'gardening'
  | 'painting'
  | 'carpentry'
  | 'moving'
  | 'other';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface TimeSlot {
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface BudgetRange {
  min: number;
  max: number;
  currency: string;
}

export interface ProviderRanking {
  providerId: string;
  providerName: string;
  businessName?: string;
  avatar?: string;
  matchScore: number; // 0-100
  trustScore: number; // 0-5
  distance: number; // in km
  averageRating: number; // 0-5
  totalReviews: number;
  serviceCategories: string[];
  isVerified: boolean;
  isAvailable: boolean;
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;

  // Request details
  serviceCategory: ServiceCategory;
  description: string;
  location: Location;
  timeSlot: TimeSlot;
  budget?: BudgetRange;

  // Matching
  rankedProviders?: ProviderRanking[];
  selectedProviderId?: string;

  // Assignment
  assignedProviderId?: string;
  assignedProviderName?: string;

  // Status
  status: ServiceRequestStatus;
  statusHistory: StatusHistoryEntry[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  completedAt?: string;

  // Rating
  rating?: number;
  review?: string;
  reviewedAt?: string;
}

export interface StatusHistoryEntry {
  status: ServiceRequestStatus;
  timestamp: string;
  note?: string;
}

export interface Review {
  id: string;
  requestId: string;
  clientId: string;
  clientName: string;
  providerId: string;
  rating: number; // 1-5
  reviewText?: string;
  createdAt: string;
}
