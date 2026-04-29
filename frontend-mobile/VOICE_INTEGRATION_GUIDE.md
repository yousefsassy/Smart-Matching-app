# Voice Integration Guide

## Goal

Keep voice recognition usable for the whole team while the backend is still being integrated incrementally.

## Current Runtime Model

The voice feature supports three runtimes:

- `mock`
- `gemini`
- `backend`

Runtime resolution lives in `src/config/appEnvironment.ts` and `src/features/voiceRequest/services/runtimeResolver.ts`.

## Recommended Team Setup

### Option 1: Shared local backend

Use this when the local voice backend is available.

Environment:

```env
EXPO_PUBLIC_VOICE_RUNTIME=backend
EXPO_PUBLIC_VOICE_BACKEND_URL=http://localhost:3030
EXPO_PUBLIC_REQUESTS_RUNTIME=mock
```

If you test from a physical device, replace `localhost` with your computer's current LAN IP, for example `http://192.168.0.28:3030`.

### Option 2: Gemini fallback

Use this when the voice backend is not running but a developer has a Gemini key.

Environment:

```env
EXPO_PUBLIC_VOICE_RUNTIME=gemini
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
EXPO_PUBLIC_REQUESTS_RUNTIME=mock
```

### Option 3: Fully mock-safe

Use this when neither the backend nor Gemini is available.

Environment:

```env
EXPO_PUBLIC_VOICE_RUNTIME=mock
EXPO_PUBLIC_REQUESTS_RUNTIME=mock
```

## Backend Readiness Rules

- screens should never read env variables directly
- screens should not import mock voice implementations directly
- voice UI should depend on service contracts and runtime resolvers
- backend URL handling should stay centralized in `appEnvironment.ts`
- request creation should keep using the request service contract even while it is mocked

## Current Team-Safe Boundary

Voice can already be shared across the team because:

- the runtime is explicit
- backend URLs are centralized
- mock fallback remains available
- the request side remains isolated behind `requestsService`

## Next Backend Steps

1. Implement `backendRequestsService.ts` against the real API contract.
2. Keep `ServiceRequestContext` unchanged and switch runtimes via env.
3. Add backend implementations for auth/profile/providers only when their endpoints are stable.
4. Remove mock defaults only after the backend adapters are proven in team environments.
