export const STORAGE_KEYS = {
  authSession: '@smartmatch_user',
  requests: '@smartmatch_requests',
  avatarPrefix: '@tawtaw_avatar_',
} as const;

export const MOCK_NETWORK_DELAYS = {
  authLoginMs: 1000,
  authSignupMs: 1200,
  requestCreateMs: 800,
  requestMutationMs: 500,
  matchingRevealMs: 700,
} as const;

export const BRAND_COPY = {
  mobileAppName: 'TawTaw',
  adminAppName: 'SmartMatch',
} as const;
