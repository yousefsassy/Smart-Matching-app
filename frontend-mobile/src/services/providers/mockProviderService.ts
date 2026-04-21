import { ProviderRanking } from '../../types/serviceRequest';
import { ProviderService } from './providerService';

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
    trustScore: 5,
    distance: 4.5,
    averageRating: 5,
    totalReviews: 56,
    serviceCategories: ['electrical', 'carpentry'],
    isVerified: false,
    isAvailable: true,
  },
];

export const mockProviderService: ProviderService = {
  async getRankedProviders({ serviceCategory }) {
    return [...mockProviders]
      .filter((provider) => provider.serviceCategories.includes(serviceCategory))
      .sort((left, right) => right.matchScore - left.matchScore);
  },
};
