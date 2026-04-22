import { User } from '../../types/auth';
import {
  CreateServiceRequestInput,
  RequestRatingInput,
  ServiceRequest,
  ServiceRequestStatus,
} from '../../types/serviceRequest';
import { RequestsService } from './requestsService';

function notImplemented(methodName: string): never {
  throw new Error(
    `Requests backend adapter is not implemented yet for "${methodName}". ` +
      'Keep EXPO_PUBLIC_REQUESTS_RUNTIME=mock until the backend request endpoints are wired.'
  );
}

export const backendRequestsService: RequestsService = {
  async loadRequests(): Promise<ServiceRequest[]> {
    return notImplemented('loadRequests');
  },

  async createServiceRequest(_actor: User, _input: CreateServiceRequestInput): Promise<ServiceRequest[]> {
    return notImplemented('createServiceRequest');
  },

  async selectProvider(_requestId: string, _providerId: string): Promise<ServiceRequest[]> {
    return notImplemented('selectProvider');
  },

  async acceptRequest(_requestId: string, _actor: User): Promise<ServiceRequest[]> {
    return notImplemented('acceptRequest');
  },

  async rejectRequest(
    _requestId: string,
    _actorName: string,
    _reason?: string
  ): Promise<ServiceRequest[]> {
    return notImplemented('rejectRequest');
  },

  async updateRequestStatus(
    _requestId: string,
    _status: Extract<ServiceRequestStatus, 'in_progress' | 'completed'>
  ): Promise<ServiceRequest[]> {
    return notImplemented('updateRequestStatus');
  },

  async rateProvider(_input: RequestRatingInput): Promise<ServiceRequest[]> {
    return notImplemented('rateProvider');
  },

  async cancelRequest(_requestId: string): Promise<ServiceRequest[]> {
    return notImplemented('cancelRequest');
  },
};
