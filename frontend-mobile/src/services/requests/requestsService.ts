import { User } from '../../types/auth';
import {
  CreateServiceRequestInput,
  RequestRatingInput,
  ServiceRequest,
  ServiceRequestStatus,
} from '../../types/serviceRequest';

export interface RequestsService {
  loadRequests: () => Promise<ServiceRequest[]>;
  createServiceRequest: (actor: User, input: CreateServiceRequestInput) => Promise<ServiceRequest[]>;
  selectProvider: (requestId: string, providerId: string) => Promise<ServiceRequest[]>;
  acceptRequest: (requestId: string, actor: User) => Promise<ServiceRequest[]>;
  rejectRequest: (requestId: string, actorName: string, reason?: string) => Promise<ServiceRequest[]>;
  updateRequestStatus: (
    requestId: string,
    status: Extract<ServiceRequestStatus, 'in_progress' | 'completed'>
  ) => Promise<ServiceRequest[]>;
  rateProvider: (input: RequestRatingInput) => Promise<ServiceRequest[]>;
  cancelRequest: (requestId: string) => Promise<ServiceRequest[]>;
}
