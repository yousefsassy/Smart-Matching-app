# SmartMatch Mobile Frontend Architecture

## Overview

`frontend-mobile` is a frontend-first React Native + Expo application. The backend is not live yet, so the app now treats persistence and network behavior explicitly as mock adapter behavior instead of hiding it inside screens.

The current goal of the mobile codebase is:

- preserve the existing product intent and working flows
- keep UI concerns separate from data orchestration
- make backend integration straightforward later
- avoid pretending that mocked behavior is real server persistence

## Current Structure

### `src/screens`

Screen files are responsible for presentation, navigation, and user interaction. They should not own mock databases or fake backend workflows directly.

Examples:

- auth screens: login, client signup, provider signup
- request screens: create request, request detail, provider rating
- dashboard screens: client, provider, calendar, profile

### `src/components`

Reusable UI building blocks and flow-specific subcomponents live here. The current structure mixes generic UI with grouped feature components such as:

- `ProviderSignup/*`
- `ServiceRequest/*`
- `location/*`

### `src/context`

Contexts are now thinner orchestration layers:

- `AuthContext.tsx`
- `ServiceRequestContext.tsx`

They expose app-facing state and actions, but delegate persistence and workflow logic to service adapters instead of embedding raw mock data manipulation inside the provider itself.

### `src/services`

This is the main backend-prep layer.

- `services/auth`
- `services/profile`
- `services/providers`
- `services/requests`

Each domain contains:

- a service contract/interface
- a mock implementation
- an optional backend implementation or placeholder adapter
- a runtime resolver when the domain can switch adapters
- a barrel export

This lets screens and contexts depend on stable frontend contracts now while keeping the eventual backend swap localized.

Current domains with explicit runtime selection:

- `services/requests`
- `features/voiceRequest/services`

### `src/types`

Shared DTO-style types and domain models live here.

Examples:

- `types/auth.ts`
- `types/serviceRequest.ts`

These files define request/response shapes and shared frontend contracts for auth, users, requests, providers, and ratings.

### `src/constants`

Cross-cutting app constants live here.

Examples:

- `appConfig.ts`
- `serviceCategories.ts`
- `statusConfig.ts`

These centralize mock timing, storage keys, category metadata, status metadata, and navigation-related constants that were previously duplicated across screens.

### `src/config`

Runtime and environment resolution now live in a dedicated configuration layer.

Examples:

- `config/appEnvironment.ts`

This is the shared source of truth for:

- public Expo env variables
- backend base URLs
- explicit runtime overrides such as mock vs backend
- voice runtime selection

Screens and contexts should not read `process.env` directly.

### `src/utils`

Pure helpers that should stay presentation-agnostic.

Examples:

- `validation.ts`
- `formatters.ts`

This is where reusable form validation and formatting logic belongs instead of being copied into screens.

### `src/navigation`

Navigation configuration is now typed from a single source of truth.

Examples:

- `types.ts`
- `AuthStack.tsx`
- `MainTabs.tsx`

Route params and tab-hiding rules should come from navigation types/constants rather than ad hoc string checks spread through screens.

## Data Flow

The intended frontend flow is now:

1. A screen triggers a user action.
2. A context or screen-level handler calls a service method.
3. The service method resolves against the current runtime adapter.
4. The context updates app state.
5. The screen renders loading, empty, success, or error UI based on that state.

This keeps fake persistence out of the UI layer and gives backend integration a cleaner handoff point.

## Mock Adapter Boundary

The app still uses mock implementations for backend-dependent flows, but they are intentionally isolated behind services.

Current mock-backed domains:

- auth/session
- profile updates
- request creation and lifecycle
- provider ranking and assignment

Backend-ready domains now expose an explicit resolver instead of importing mock implementations directly inside contexts.

Examples:

- `requestsService` resolves through `services/requests/index.ts`
- `transcriptionService` and `requestParserService` resolve through the voice runtime

These mocks may use local storage or in-memory data to simulate behavior, but they are not real backend persistence.

## BACKEND NEEDED

The following areas still require real backend support to become production-complete:

- real authentication and session issuance
- provider/client account persistence
- request creation persistence and retrieval
- provider search, ranking, and assignment logic
- request status updates shared across client/provider devices
- profile media upload and persistent avatar storage
- real notifications, messaging, and audit history
- admin-side live data and moderation actions

## Integration Guidance

When the backend is ready, replace mock adapters inside `src/services/*` rather than rewriting screens.

Recommended migration path:

1. Keep the service interfaces stable.
2. Replace mock implementations with API-backed implementations.
3. Map backend payloads to the shared frontend types.
4. Preserve loading/error/empty states already established in screens.
5. Remove mock timing/storage behavior only after the corresponding backend endpoint exists.

### Runtime Configuration

Team members should rely on the shared env contract in `.env.example`.

Important runtime controls:

- `EXPO_PUBLIC_VOICE_RUNTIME=mock|gemini|backend`
- `EXPO_PUBLIC_REQUESTS_RUNTIME=mock|backend`
- `EXPO_PUBLIC_APP_API_BASE_URL=...`
- `EXPO_PUBLIC_VOICE_BACKEND_URL=...`
- `EXPO_PUBLIC_GEMINI_API_KEY=...`

Recommended local defaults today:

- keep `EXPO_PUBLIC_REQUESTS_RUNTIME=mock`
- use `EXPO_PUBLIC_VOICE_RUNTIME=backend` only when the local voice backend is running
- otherwise use `gemini` or let the app fall back to `mock`

This makes voice recognition consistent for the whole team while the rest of the backend is still being integrated.

## Working Rules For This Frontend

- screens should not import scattered mock datasets directly
- screens should prefer services, contexts, constants, and helpers
- validation rules should stay centralized
- category/status presentation should stay centralized
- backend-dependent behavior should be explicit at the service boundary
- avoid inventing server behavior in UI components

This keeps the frontend maintainable today and much easier to connect to a real backend later.
