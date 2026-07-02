export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'clients', label: 'Clients', icon: '👤' },
  { id: 'providers', label: 'Providers', icon: '🔧' },
  { id: 'requests', label: 'Requests', icon: '📋' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export const PAGE_TITLES = {
  dashboard: 'Dashboard',
  clients: 'Clients Management',
  providers: 'Service Providers',
  requests: 'Requests Management',
  analytics: 'Analytics',
  settings: 'Settings',
};

export const ADMIN_ACCOUNTS = [
  {
    email: 'admin@smartmatch.com',
    password: 'admin123',
    name: 'Admin User',
    avatar: 'AU',
  },
  {
    email: 'firas@smartmatch.com',
    password: 'firas123',
    name: 'Firas Saidi',
    avatar: 'FS',
  },
];

export const DASHBOARD_ANALYTICS = {
  revenue: { value: '$48,200', trend: 18 },
  users: { value: '1,284', trend: 12 },
  requests: { value: '342', trend: 24 },
  completion: { value: '91%', trend: 3 },
};

export const DASHBOARD_RECENT_ACTIVITY = [
  {
    id: 1,
    type: 'New User',
    desc: 'Emma Davis registered as Provider',
    time: '2 min ago',
    icon: '👤',
  },
  {
    id: 2,
    type: 'New Request',
    desc: 'Lisa Park created a Cleaning request',
    time: '18 min ago',
    icon: '📋',
  },
  {
    id: 3,
    type: 'Request Done',
    desc: "Sarah Chen's Plumbing job completed",
    time: '1 hr ago',
    icon: '✅',
  },
  {
    id: 4,
    type: 'User Flagged',
    desc: 'David Miller flagged for review',
    time: '3 hr ago',
    icon: '⚠️',
  },
  {
    id: 5,
    type: 'New Review',
    desc: 'Michael Roberts received 5 ⭐ rating',
    time: '5 hr ago',
    icon: '⭐',
  },
];

export const DASHBOARD_CHART_DATA = [
  { month: 'Sep', requests: 28 },
  { month: 'Oct', requests: 35 },
  { month: 'Nov', requests: 42 },
  { month: 'Dec', requests: 38 },
  { month: 'Jan', requests: 55 },
  { month: 'Feb', requests: 61 },
];
