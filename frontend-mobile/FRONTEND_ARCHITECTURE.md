# SmartMatch App - Frontend Structure

## What is SmartMatch?

SmartMatch is a mobile app that connects **clients** (people who need services) with **service providers** (businesses/freelancers who offer services). Think of it like a two-sided marketplace where clients can find the right provider, and providers can showcase their services to potential clients.

The app is built with **React Native**, meaning it works on both iPhone and Android from a single codebase.

## Tech Stack (What We're Using)

- **React Native + Expo**: Framework for building mobile apps with JavaScript/TypeScript
- **React Navigation**: Library that handles moving between different screens in the app
- **TypeScript**: Adds type-checking to catch bugs before runtime
- **AsyncStorage**: Saves user data locally on the phone (like staying logged in)
- **Context API**: React's built-in way to share data across the entire app (like user info)

## How the App is Organized

### `/src`

This is the main folder that contains everything we wrote. Inside, we organize code by what it does (components, screens, navigation, etc.).

### `/src/components` - Reusable UI Building Blocks

**What's inside:**

- **`Card.tsx`** - Box containers that hold content (used in dashboards)
- **`Input.tsx`** - Text input fields for forms (email, password, etc.)
- **`Checkbox.tsx`** - Checkboxes for accepting terms, selecting options
- **`ToggleSwitch.tsx`** - On/off switches (like enabling notifications)
- **`PrimaryButton.tsx`** - Main action buttons with loading spinners
- **`Icons.tsx`** - All the icons used in the app (home, profile, messages, etc.)
- **`StatWidget.tsx`** - Dashboard cards showing stats (like "5 Active Matches")
- **`RoleSelector.tsx`** - Component for choosing between Client or Provider during signup

**Why this matters:** If we need to change how all buttons look, we edit one file instead of 20 different screens.

### `/src/screens` - Full App Pages

Each file here represents one full screen users see when navigating the app. Screens use components from `/components` to build their layout.

**Our screens:**

- **`LoginScreen.tsx`** - Where users enter email/password to log in
- **`SignupScreen.tsx`** - Account creation form with role selection
- **`ClientDashboardScreen.tsx`** - Homepage for clients (shows matches, browse providers)
- **`ProviderDashboardScreen.tsx`** - Homepage for providers (shows client requests, profile stats)
- **`ProfileScreen.tsx`** - Account settings and profile editing (biggest screen at 20KB)
- **`PlaceholderScreen.tsx`** - Temporary screen for features we haven't built yet

**Why separate?** Clients and providers see completely different dashboards based on their role. The app checks `user.role` and shows the appropriate screen.

### `/src/navigation`

This folder controls which screens users can access and when.

**Navigation files:**

- **`RootNavigator.tsx`** - The "traffic controller" that decides: Are you logged in? → Show main app. Not logged in? → Show login/signup.
- **`AuthStack.tsx`** - Login and signup flow (stack navigation = screens slide in from the right)
- **`MainTabs.tsx`** - Bottom tab bar after logging in (Home, Messages, Notifications, Profile)
- **`index.ts`** - Type definitions so TypeScript knows what screens exist

**The flow:**

1. App starts → Check if user is logged in
2. If yes → `MainTabs` (main app with bottom navigation)
3. If no → `AuthStack` (login/signup screens)

### `/src/context` - Shared App-Wide Data

This folder manages data that many screens need access to (like "who is the current user?").

**What's inside:**

- **`AuthContext.tsx`** - Manages everything about the logged-in user:
  - Is someone logged in? (`isAuthenticated`)
  - Who are they? (`user` object with name, email, role)
  - Login/logout/signup functions
  - Mock user database (for now, since we don't have a real backend yet)
  - Saves session to phone storage so you stay logged in after closing the app

**How screens use it:**

```typescript
const { user, login, logout } = useAuth(); // Get user data in any component
```

**Why mock data?** We're developing the frontend first. Later, we'll replace the mock database with real API calls to a backend server.

### `/src/theme` - Design System (Colors, Fonts, Spacing)

Instead of writing `color: '#3D9DED'` everywhere, we define all design values in one place. This keeps the app looking consistent.

**What's defined:**

- **`colors`** - Primary blue palette, accent colors (cyan, purple), neutral grays, gradients
- **`typography`** - Font sizes (xs, sm, base, lg, xl), weights (regular, bold)
- **`spacing`** - Consistent gaps between elements (8px, 16px, 24px, etc.)
- **`borderRadius`** - Rounded corner sizes
- **`shadows`** - Drop shadow styles for cards and buttons
- **`animations`** - Timing for transitions (fast = 150ms, normal = 250ms)

**Example usage:**

```typescript
import { colors, spacing } from '../theme';

<View style={{ backgroundColor: colors.primary[500], padding: spacing.md }} />
```

**Why this helps:** If we want to rebrand the app with different colors, we change 6 lines instead of 200.

### `/assets` - Images and Icons

Contains the app icon that appears on your phone's home screen, the splash screen when launching, and the favicon for web.

**Files:**

- `icon.png` - Main app icon
- `adaptive-icon.png` - Android adaptive icon (with background)
- `splash-icon.png` - Loading screen image
- `favicon.png` - Web browser tab icon

Expo automatically optimizes these images for different screen sizes when building the app.

### Root Files (What They Do)

- **`App.tsx`** - The starting point. Wraps the entire app with providers (auth, navigation, gestures)
- **`package.json`** - Lists all libraries we installed (react-navigation, expo, etc.)
- **`tsconfig.json`** - TypeScript settings (how strict should type-checking be?)
- **`app.json`** - Expo configuration (app name, version, icon paths)

## How Data Flows in the App

This is how user authentication works from login to seeing your profile:

```
1. User taps "Login" on LoginScreen
       ↓
2. Calls login(email, password) from useAuth() hook
       ↓
3. AuthContext checks credentials against mock database
       ↓
4. If valid, saves user to AsyncStorage (phone memory)
       ↓
5. Updates user state → triggers re-render
       ↓
6. RootNavigator sees isAuthenticated = true
       ↓
7. Switches from AuthStack to MainTabs
       ↓
8. User sees their dashboard (Client or Provider based on role)
```

## Visual App Structure

```
App.tsx (Entry Point)
  │
  └─ AuthProvider (Manages logged-in user)
      │
      └─ RootNavigator (Decides which screens to show)
          │
          ├─ If NOT logged in → AuthStack
          │   ├─ LoginScreen
          │   └─ SignupScreen
          │
          └─ If logged in → MainTabs (Bottom Navigation)
              ├─ Home Tab → ClientDashboard OR ProviderDashboard
              ├─ Messages Tab → PlaceholderScreen
              ├─ Notifications Tab → PlaceholderScreen
              └─ Profile Tab → ProfileScreen
```

## Why We Organized It This Way

### Easy to Find Stuff

- Need to change a button? → `/src/components/PrimaryButton.tsx`
- Need to edit the login screen? → `/src/screens/LoginScreen.tsx`
- Need to add a new color? → `/src/theme/index.ts`

Clear naming (files end with `Screen.tsx`, `Context.tsx`) makes it obvious what each file does.

### Easy to Add Features

- New screen? → Add to `/src/screens` and register in a navigator
- New button style? → Add to `/src/components`
- New user setting? → Extend `AuthContext` or create new context

We don't need to restructure folders when adding features.

### Team-Friendly

- One person can work on the ProfileScreen while another builds the ClientDashboard (screens are independent)
- Designer updates colors in `/theme` without touching component code
- TypeScript catches errors when someone passes wrong data to a component

## Getting Started (For New Team Members)

1. **To run the app:** `npm start` → scan QR code with Expo Go app
2. **To login:** Use demo accounts from `AuthContext.tsx` (client@demo.com / provider@demo.com, password: demo123)
3. **To add a new screen:**
   - Create `YourScreen.tsx` in `/src/screens`
   - Import components from `/src/components`
   - Add route to `/src/navigation/MainTabs.tsx` or `AuthStack.tsx`
4. **To use theme:** Import from `/src/theme` instead of hardcoding colors
5. **To access user data:** Use `const { user } = useAuth();` in any component

## What's Next? (Future Plans)

- **Connect to Real Backend:** Replace mock data in `AuthContext` with API calls (fetch from server)
- **Matching Algorithm:** Build the smart matching logic between clients and providers
- **Messaging System:** Implement real-time chat between users
- **Provider Profiles:** Let providers showcase services, ratings, reviews
- **Search & Filters:** Help clients find providers by category, location, price
- **Notifications:** Push notifications for new matches and messages
