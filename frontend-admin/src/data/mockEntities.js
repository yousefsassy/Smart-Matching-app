export const CLIENTS_PAGE_SIZE = 9;
export const PROVIDERS_PAGE_SIZE = 9;
export const REQUESTS_PAGE_SIZE = 8;

export const PROVIDER_SERVICE_CATEGORIES = [
  'all',
  'plumbing',
  'electrical',
  'cleaning',
  'gardening',
  'painting',
  'carpentry',
  'moving',
  'consulting',
];

export const REQUEST_STATUSES = [
  'all',
  'pending',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
  'rejected',
];

export const REQUEST_CATEGORIES = [
  'all',
  'plumbing',
  'electrical',
  'cleaning',
  'gardening',
  'painting',
  'carpentry',
  'moving',
  'consulting',
];

export const REQUEST_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'status', label: 'By status' },
];

export const MOCK_CLIENTS = [
  { id: 'c01', fullName: 'Emma Davis', email: 'emma.davis@email.com', phone: '+1 (555) 234-5678', location: 'New York, NY', joinedAt: '2024-01-15', requests: 5, status: 'active', avatar: 'ED' },
  { id: 'c02', fullName: 'Lisa Park', email: 'lisa.park@email.com', phone: '+1 (555) 345-6789', location: 'Los Angeles, CA', joinedAt: '2024-02-20', requests: 3, status: 'active', avatar: 'LP' },
  { id: 'c03', fullName: 'Sarah Chen', email: 'sarah.chen@email.com', phone: '+1 (555) 456-7890', location: 'San Francisco, CA', joinedAt: '2024-01-08', requests: 8, status: 'active', avatar: 'SC' },
  { id: 'c04', fullName: 'James Wilson', email: 'j.wilson@email.com', phone: '+1 (555) 567-8901', location: 'Chicago, IL', joinedAt: '2024-03-02', requests: 2, status: 'active', avatar: 'JW' },
  { id: 'c05', fullName: 'Olivia Martinez', email: 'o.martinez@email.com', phone: '+1 (555) 678-9012', location: 'Miami, FL', joinedAt: '2024-02-14', requests: 6, status: 'active', avatar: 'OM' },
  { id: 'c06', fullName: 'Noah Thompson', email: 'noah.t@email.com', phone: '+1 (555) 789-0123', location: 'Houston, TX', joinedAt: '2024-01-30', requests: 4, status: 'inactive', avatar: 'NT' },
  { id: 'c07', fullName: 'Ava Anderson', email: 'ava.anderson@email.com', phone: '+1 (555) 890-1234', location: 'Phoenix, AZ', joinedAt: '2024-03-10', requests: 1, status: 'active', avatar: 'AA' },
  { id: 'c08', fullName: 'Liam Jackson', email: 'liam.j@email.com', phone: '+1 (555) 901-2345', location: 'Philadelphia, PA', joinedAt: '2024-02-05', requests: 7, status: 'active', avatar: 'LJ' },
  { id: 'c09', fullName: 'Sophia White', email: 's.white@email.com', phone: '+1 (555) 012-3456', location: 'San Antonio, TX', joinedAt: '2024-01-22', requests: 3, status: 'active', avatar: 'SW' },
  { id: 'c10', fullName: 'Ethan Harris', email: 'ethan.h@email.com', phone: '+1 (555) 123-4567', location: 'San Diego, CA', joinedAt: '2024-03-18', requests: 2, status: 'flagged', avatar: 'EH' },
  { id: 'c11', fullName: 'Isabella Clark', email: 'i.clark@email.com', phone: '+1 (555) 234-5679', location: 'Dallas, TX', joinedAt: '2024-02-28', requests: 9, status: 'active', avatar: 'IC' },
  { id: 'c12', fullName: 'Mason Lewis', email: 'mason.lewis@email.com', phone: '+1 (555) 345-6780', location: 'San Jose, CA', joinedAt: '2024-01-10', requests: 0, status: 'inactive', avatar: 'ML' },
  { id: 'c13', fullName: 'Mia Robinson', email: 'mia.r@email.com', phone: '+1 (555) 456-7891', location: 'Austin, TX', joinedAt: '2024-03-05', requests: 4, status: 'active', avatar: 'MR' },
  { id: 'c14', fullName: 'Faten Amri', email: 'faten@demo.com', phone: '+216 20 123 456', location: 'Tunis, Tunisia', joinedAt: '2024-01-01', requests: 12, status: 'active', avatar: 'FA' },
  { id: 'c15', fullName: 'Charlotte Young', email: 'c.young@email.com', phone: '+1 (555) 567-8902', location: 'Jacksonville, FL', joinedAt: '2024-02-22', requests: 5, status: 'active', avatar: 'CY' },
];

export const INITIAL_PROVIDERS = [
  { id: 'p01', fullName: 'Firas Saidi', email: 'firas@consulting.com', phone: '+216 55 111 222', businessName: 'Saidi Consulting', serviceCategory: 'consulting', rating: 4.9, reviews: 42, location: 'Tunis, Tunisia', joinedAt: '2023-12-01', status: 'approved', avatar: 'FS' },
  { id: 'p02', fullName: 'Michael Roberts', email: 'm.roberts@plumbing.com', phone: '+1 (555) 222-3333', businessName: 'Roberts Plumbing', serviceCategory: 'plumbing', rating: 4.8, reviews: 38, location: 'New York, NY', joinedAt: '2024-01-10', status: 'approved', avatar: 'MR' },
  { id: 'p03', fullName: 'Emma Williams', email: 'e.williams@electric.com', phone: '+1 (555) 333-4444', businessName: 'Williams Electric', serviceCategory: 'electrical', rating: 5, reviews: 15, location: 'Chicago, IL', joinedAt: '2024-02-28', status: 'pending', avatar: 'EW' },
  { id: 'p04', fullName: 'Carlos Mendez', email: 'c.mendez@cleaning.com', phone: '+1 (555) 444-5555', businessName: 'Sparkle Clean Co.', serviceCategory: 'cleaning', rating: 4.7, reviews: 61, location: 'Miami, FL', joinedAt: '2024-01-18', status: 'approved', avatar: 'CM' },
  { id: 'p05', fullName: 'Aisha Patel', email: 'aisha.p@gardening.com', phone: '+1 (555) 555-6666', businessName: 'Green Thumb Gardens', serviceCategory: 'gardening', rating: 4.6, reviews: 29, location: 'Los Angeles, CA', joinedAt: '2024-03-05', status: 'pending', avatar: 'AP' },
  { id: 'p06', fullName: 'David Kim', email: 'd.kim@painting.com', phone: '+1 (555) 666-7777', businessName: 'Kim Premium Painting', serviceCategory: 'painting', rating: 4.5, reviews: 47, location: 'San Francisco, CA', joinedAt: '2024-02-10', status: 'approved', avatar: 'DK' },
  { id: 'p07', fullName: 'Sophie Turner', email: 's.turner@moving.com', phone: '+1 (555) 777-8888', businessName: 'Turner Moving Services', serviceCategory: 'moving', rating: 4.3, reviews: 22, location: 'Seattle, WA', joinedAt: '2024-03-15', status: 'pending', avatar: 'ST' },
  { id: 'p08', fullName: 'Omar Hassan', email: 'o.hassan@carpentry.com', phone: '+1 (555) 888-9999', businessName: 'Hassan Woodworks', serviceCategory: 'carpentry', rating: 4.9, reviews: 18, location: 'Houston, TX', joinedAt: '2024-01-25', status: 'rejected', avatar: 'OH' },
  { id: 'p09', fullName: 'Nina Johansson', email: 'nina.j@cleaning.com', phone: '+1 (555) 999-0000', businessName: 'Nordic Clean Pros', serviceCategory: 'cleaning', rating: 4.8, reviews: 33, location: 'Minneapolis, MN', joinedAt: '2024-02-20', status: 'approved', avatar: 'NJ' },
  { id: 'p10', fullName: 'Ahmed Benali', email: 'a.benali@plumbing.com', phone: '+216 50 222 333', businessName: 'Benali Plumbing', serviceCategory: 'plumbing', rating: 4.6, reviews: 9, location: 'Sfax, Tunisia', joinedAt: '2024-03-20', status: 'pending', avatar: 'AB' },
  { id: 'p11', fullName: 'Rachel Green', email: 'r.green@electrical.com', phone: '+1 (555) 011-2222', businessName: 'Green Electric', serviceCategory: 'electrical', rating: 4.7, reviews: 54, location: 'Boston, MA', joinedAt: '2024-01-05', status: 'approved', avatar: 'RG' },
  { id: 'p12', fullName: 'Tom Bradley', email: 't.bradley@painting.com', phone: '+1 (555) 122-3333', businessName: 'Bradley & Sons Paint', serviceCategory: 'painting', rating: 3.9, reviews: 12, location: 'Denver, CO', joinedAt: '2024-03-22', status: 'rejected', avatar: 'TB' },
];

export const MOCK_REQUESTS = [
  { id: 'REQ-001', clientName: 'Emma Davis', clientEmail: 'emma.davis@email.com', clientPhone: '+1 (555) 234-5678', providerName: 'Michael Roberts', providerBusiness: 'Roberts Plumbing', providerPhone: '+1 (555) 222-3333', serviceCategory: 'plumbing', description: 'Bathroom faucet leaking badly, needs urgent repair and pipe inspection.', location: 'New York, NY', scheduledDate: '2024-03-20', scheduledTime: '10:00 – 12:00', budget: { min: 80, max: 150 }, status: 'completed', rating: 5, createdAt: '2024-03-14T09:30:00', statusHistory: ['pending', 'assigned', 'in_progress', 'completed'] },
  { id: 'REQ-002', clientName: 'Lisa Park', clientEmail: 'lisa.park@email.com', clientPhone: '+1 (555) 345-6789', providerName: 'Emma Williams', providerBusiness: 'Williams Electric', providerPhone: '+1 (555) 333-4444', serviceCategory: 'electrical', description: 'Circuit breaker keeps tripping in the kitchen. Need full diagnosis.', location: 'Los Angeles, CA', scheduledDate: '2024-03-22', scheduledTime: '14:00 – 16:00', budget: { min: 120, max: 250 }, status: 'in_progress', rating: null, createdAt: '2024-03-18T11:15:00', statusHistory: ['pending', 'assigned', 'in_progress'] },
  { id: 'REQ-003', clientName: 'Sarah Chen', clientEmail: 'sarah.chen@email.com', clientPhone: '+1 (555) 456-7890', providerName: 'Carlos Mendez', providerBusiness: 'Sparkle Clean Co.', providerPhone: '+1 (555) 444-5555', serviceCategory: 'cleaning', description: 'Deep cleaning for 3-bedroom apartment before moving out.', location: 'San Francisco, CA', scheduledDate: '2024-03-25', scheduledTime: '09:00 – 13:00', budget: { min: 200, max: 350 }, status: 'assigned', rating: null, createdAt: '2024-03-19T08:00:00', statusHistory: ['pending', 'assigned'] },
  { id: 'REQ-004', clientName: 'James Wilson', clientEmail: 'j.wilson@email.com', clientPhone: '+1 (555) 567-8901', providerName: null, providerBusiness: null, providerPhone: null, serviceCategory: 'gardening', description: 'Lawn maintenance, hedge trimming, and garden bed setup.', location: 'Chicago, IL', scheduledDate: '2024-03-28', scheduledTime: '08:00 – 11:00', budget: { min: 60, max: 100 }, status: 'pending', rating: null, createdAt: '2024-03-20T14:45:00', statusHistory: ['pending'] },
  { id: 'REQ-005', clientName: 'Olivia Martinez', clientEmail: 'o.martinez@email.com', clientPhone: '+1 (555) 678-9012', providerName: 'David Kim', providerBusiness: 'Kim Premium Painting', providerPhone: '+1 (555) 666-7777', serviceCategory: 'painting', description: 'Interior painting for living room and two bedrooms. Light grey color.', location: 'Miami, FL', scheduledDate: '2024-03-15', scheduledTime: '08:00 – 17:00', budget: { min: 400, max: 700 }, status: 'completed', rating: 4, createdAt: '2024-03-08T10:00:00', statusHistory: ['pending', 'assigned', 'in_progress', 'completed'] },
  { id: 'REQ-006', clientName: 'Noah Thompson', clientEmail: 'noah.t@email.com', clientPhone: '+1 (555) 789-0123', providerName: null, providerBusiness: null, providerPhone: null, serviceCategory: 'carpentry', description: 'Custom built-in bookshelf for home office, walnut finish.', location: 'Houston, TX', scheduledDate: '2024-04-02', scheduledTime: '10:00 – 15:00', budget: { min: 300, max: 500 }, status: 'pending', rating: null, createdAt: '2024-03-21T16:20:00', statusHistory: ['pending'] },
  { id: 'REQ-007', clientName: 'Ava Anderson', clientEmail: 'ava.anderson@email.com', clientPhone: '+1 (555) 890-1234', providerName: 'Sophie Turner', providerBusiness: 'Turner Moving Services', providerPhone: '+1 (555) 777-8888', serviceCategory: 'moving', description: 'Full apartment move, 2BR, ground to 4th floor. Need 2 helpers.', location: 'Phoenix, AZ', scheduledDate: '2024-03-30', scheduledTime: '07:00 – 14:00', budget: { min: 250, max: 400 }, status: 'assigned', rating: null, createdAt: '2024-03-19T12:00:00', statusHistory: ['pending', 'assigned'] },
  { id: 'REQ-008', clientName: 'Liam Jackson', clientEmail: 'liam.j@email.com', clientPhone: '+1 (555) 901-2345', providerName: 'Nina Johansson', providerBusiness: 'Nordic Clean Pros', providerPhone: '+1 (555) 999-0000', serviceCategory: 'cleaning', description: 'Weekly office cleaning contract, 500 sqft space.', location: 'Philadelphia, PA', scheduledDate: '2024-03-18', scheduledTime: '18:00 – 20:00', budget: { min: 80, max: 120 }, status: 'completed', rating: 5, createdAt: '2024-03-10T09:00:00', statusHistory: ['pending', 'assigned', 'in_progress', 'completed'] },
  { id: 'REQ-009', clientName: 'Sophia White', clientEmail: 's.white@email.com', clientPhone: '+1 (555) 012-3456', providerName: 'Firas Saidi', providerBusiness: 'Saidi Consulting', providerPhone: '+216 55 111 222', serviceCategory: 'consulting', description: 'Business plan review and market analysis for startup launch.', location: 'San Antonio, TX', scheduledDate: '2024-03-23', scheduledTime: '11:00 – 13:00', budget: { min: 150, max: 300 }, status: 'in_progress', rating: null, createdAt: '2024-03-17T14:30:00', statusHistory: ['pending', 'assigned', 'in_progress'] },
  { id: 'REQ-010', clientName: 'Ethan Harris', clientEmail: 'ethan.h@email.com', clientPhone: '+1 (555) 123-4567', providerName: 'Rachel Green', providerBusiness: 'Green Electric', providerPhone: '+1 (555) 011-2222', serviceCategory: 'electrical', description: 'Smart home installation: lighting automation and smart locks.', location: 'San Diego, CA', scheduledDate: '2024-03-12', scheduledTime: '09:00 – 17:00', budget: { min: 500, max: 900 }, status: 'cancelled', rating: null, createdAt: '2024-03-05T08:15:00', statusHistory: ['pending', 'assigned', 'cancelled'] },
  { id: 'REQ-011', clientName: 'Isabella Clark', clientEmail: 'i.clark@email.com', clientPhone: '+1 (555) 234-5679', providerName: 'Michael Roberts', providerBusiness: 'Roberts Plumbing', providerPhone: '+1 (555) 222-3333', serviceCategory: 'plumbing', description: 'Water heater replacement and full bathroom re-plumbing.', location: 'Dallas, TX', scheduledDate: '2024-03-26', scheduledTime: '10:00 – 14:00', budget: { min: 400, max: 600 }, status: 'in_progress', rating: null, createdAt: '2024-03-20T10:00:00', statusHistory: ['pending', 'assigned', 'in_progress'] },
  { id: 'REQ-012', clientName: 'Mia Robinson', clientEmail: 'mia.r@email.com', clientPhone: '+1 (555) 456-7891', providerName: 'Aisha Patel', providerBusiness: 'Green Thumb Gardens', providerPhone: '+1 (555) 555-6666', serviceCategory: 'gardening', description: 'Backyard landscaping redesign with native plants and irrigation.', location: 'Austin, TX', scheduledDate: '2024-03-16', scheduledTime: '08:00 – 16:00', budget: { min: 600, max: 1000 }, status: 'completed', rating: 5, createdAt: '2024-03-09T11:00:00', statusHistory: ['pending', 'assigned', 'in_progress', 'completed'] },
  { id: 'REQ-013', clientName: 'Faten Amri', clientEmail: 'faten@demo.com', clientPhone: '+216 20 123 456', providerName: null, providerBusiness: null, providerPhone: null, serviceCategory: 'cleaning', description: 'Post-construction cleaning for newly renovated villa.', location: 'Tunis, Tunisia', scheduledDate: '2024-04-05', scheduledTime: '09:00 – 15:00', budget: { min: 150, max: 250 }, status: 'pending', rating: null, createdAt: '2024-03-22T09:00:00', statusHistory: ['pending'] },
  { id: 'REQ-014', clientName: 'Charlotte Young', clientEmail: 'c.young@email.com', clientPhone: '+1 (555) 567-8902', providerName: 'David Kim', providerBusiness: 'Kim Premium Painting', providerPhone: '+1 (555) 666-7777', serviceCategory: 'painting', description: 'Exterior house painting, 2-storey, white and grey trim.', location: 'Jacksonville, FL', scheduledDate: '2024-03-10', scheduledTime: '07:00 – 18:00', budget: { min: 800, max: 1200 }, status: 'rejected', rating: null, createdAt: '2024-03-04T13:00:00', statusHistory: ['pending', 'rejected'] },
  { id: 'REQ-015', clientName: 'Mason Lewis', clientEmail: 'mason.lewis@email.com', clientPhone: '+1 (555) 345-6780', providerName: 'Emma Williams', providerBusiness: 'Williams Electric', providerPhone: '+1 (555) 333-4444', serviceCategory: 'electrical', description: 'Generator installation and electrical panel upgrade.', location: 'San Jose, CA', scheduledDate: '2024-03-08', scheduledTime: '08:00 – 14:00', budget: { min: 700, max: 1100 }, status: 'completed', rating: 4, createdAt: '2024-03-01T07:30:00', statusHistory: ['pending', 'assigned', 'in_progress', 'completed'] },
  { id: 'REQ-016', clientName: 'Sarah Chen', clientEmail: 'sarah.chen@email.com', clientPhone: '+1 (555) 456-7890', providerName: null, providerBusiness: null, providerPhone: null, serviceCategory: 'carpentry', description: 'Kitchen cabinet installation, 10 units, modern style.', location: 'San Francisco, CA', scheduledDate: '2024-04-10', scheduledTime: '08:00 – 17:00', budget: { min: 900, max: 1500 }, status: 'pending', rating: null, createdAt: '2024-03-22T15:30:00', statusHistory: ['pending'] },
  { id: 'REQ-017', clientName: 'James Wilson', clientEmail: 'j.wilson@email.com', clientPhone: '+1 (555) 567-8901', providerName: 'Carlos Mendez', providerBusiness: 'Sparkle Clean Co.', providerPhone: '+1 (555) 444-5555', serviceCategory: 'cleaning', description: 'Move-in cleaning for new apartment, 4 rooms.', location: 'Chicago, IL', scheduledDate: '2024-03-13', scheduledTime: '10:00 – 14:00', budget: { min: 120, max: 180 }, status: 'cancelled', rating: null, createdAt: '2024-03-07T09:00:00', statusHistory: ['pending', 'assigned', 'cancelled'] },
  { id: 'REQ-018', clientName: 'Liam Jackson', clientEmail: 'liam.j@email.com', clientPhone: '+1 (555) 901-2345', providerName: 'Ahmed Benali', providerBusiness: 'Benali Plumbing', providerPhone: '+216 50 222 333', serviceCategory: 'plumbing', description: 'New bathroom installation from scratch including tiling.', location: 'Philadelphia, PA', scheduledDate: '2024-03-29', scheduledTime: '08:00 – 17:00', budget: { min: 1200, max: 2000 }, status: 'assigned', rating: null, createdAt: '2024-03-21T11:00:00', statusHistory: ['pending', 'assigned'] },
];
