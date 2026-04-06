import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute, RouteProp } from '@react-navigation/native';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import ClientDashboardScreen from '../screens/ClientDashboardScreen';
import ProviderDashboardScreen from '../screens/ProviderDashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateServiceRequestScreen from '../screens/CreateServiceRequestScreen';
import MyRequestsScreen from '../screens/MyRequestsScreen';
import RequestDetailScreen from '../screens/RequestDetailScreen';
import RateProviderScreen from '../screens/RateProviderScreen';
import ManageServiceRequestsScreen from '../screens/ManageServiceRequestsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import LocationPickerScreen from '../screens/LocationPickerScreen';
import {
  HomeIcon,
  ProfileIcon,
  ClockIcon,
  CalendarIcon,
} from '../components/Icons';
import { colors, borderRadius, typography } from '../theme';
import {
  LocationPickerRouteParams,
  LocationPickerSelectionParams,
} from './locationPicker';
import {
  HomeStackParamList,
  MainTabParamList,
  TAB_HIDDEN_ROUTES,
} from './types';
export type { HomeStackParamList, MainTabParamList } from './types';

// ── Navigators ─────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ClientRequestsStack = createNativeStackNavigator<HomeStackParamList>();
const ProviderRequestsStack = createNativeStackNavigator<HomeStackParamList>();

// ── Stack navigators ───────────────────────────────────────────────────────────

function HomeStackNavigator() {
  const { user } = useAuth();
  const DashboardScreen = user?.role === 'provider' ? ProviderDashboardScreen : ClientDashboardScreen;

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[50] },
        animation: 'slide_from_right',
      }}
    >
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
      <HomeStack.Screen name="MyRequests" component={MyRequestsScreen} />
      <HomeStack.Screen name="IncomingRequests" component={ManageServiceRequestsScreen} />
      <HomeStack.Screen name="CreateRequest" component={CreateServiceRequestScreen} options={{ animation: 'fade_from_bottom' }} />
      <HomeStack.Screen name="LocationPicker" component={LocationPickerScreen} options={{ animation: 'slide_from_bottom' }} />
      <HomeStack.Screen name="RequestDetail" component={RequestDetailScreen} />
      <HomeStack.Screen name="RateProvider" component={RateProviderScreen} options={{ animation: 'slide_from_bottom' }} />
    </HomeStack.Navigator>
  );
}

function ClientRequestsStackNavigator() {
  return (
    <ClientRequestsStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[50] },
        animation: 'slide_from_right',
      }}
    >
      <ClientRequestsStack.Screen name="MyRequests" component={MyRequestsScreen} />
      <ClientRequestsStack.Screen name="CreateRequest" component={CreateServiceRequestScreen} options={{ animation: 'fade_from_bottom' }} />
      <ClientRequestsStack.Screen name="LocationPicker" component={LocationPickerScreen} options={{ animation: 'slide_from_bottom' }} />
      <ClientRequestsStack.Screen name="RequestDetail" component={RequestDetailScreen} />
      <ClientRequestsStack.Screen name="RateProvider" component={RateProviderScreen} options={{ animation: 'slide_from_bottom' }} />
    </ClientRequestsStack.Navigator>
  );
}

function ProviderRequestsStackNavigator() {
  return (
    <ProviderRequestsStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[50] },
        animation: 'slide_from_right',
      }}
    >
      <ProviderRequestsStack.Screen name="IncomingRequests" component={ManageServiceRequestsScreen} />
      <ProviderRequestsStack.Screen name="RequestDetail" component={RequestDetailScreen} />
    </ProviderRequestsStack.Navigator>
  );
}

// ── Tab icon wrapper ───────────────────────────────────────────────────────────

interface TabIconProps {
  focused: boolean;
  children: React.ReactNode;
}

function TabIcon({ focused, children }: TabIconProps) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {children}
    </View>
  );
}

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

function getTabBarStyle(
  route: Partial<RouteProp<Record<string, object | undefined>, string>>,
  insetsBottom: number
) {
  const focusedRouteName = getFocusedRouteNameFromRoute(route as any) ?? 'Dashboard';

  if (TAB_HIDDEN_ROUTES.has(focusedRouteName)) {
    return { display: 'none' as const };
  }

  return {
    backgroundColor: colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    height: 72 + insetsBottom,
    paddingTop: 10,
    paddingBottom: insetsBottom + 10,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary[900],
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  };
}

// ── Main tabs ──────────────────────────────────────────────────────────────────

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isProvider = user?.role === 'provider';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.neutral[0],
          borderTopWidth: 1,
          borderTopColor: colors.neutral[100],
          height: 72 + insets.bottom,
          paddingTop: 10,
          paddingBottom: insets.bottom + 10,
          ...Platform.select({
            ios: {
              shadowColor: colors.primary[900],
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.10,
              shadowRadius: 16,
            },
            android: {
              elevation: 12,
            },
          }),
        },
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarLabelStyle: {
          fontSize: typography.size.xs,
          fontWeight: typography.weight.bold,
          marginTop: 3,
          letterSpacing: typography.letterSpacing.wide,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      {/* Home — both roles */}
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={({ route }) => ({
          tabBarLabel: 'Home',
          tabBarStyle: getTabBarStyle(route, insets.bottom),
          tabBarIcon: ({ focused, color }: TabBarIconProps) => (
            <TabIcon focused={focused}>
              <HomeIcon color={color} size={22} />
            </TabIcon>
          ),
        })}
      />

      {/* Requests — both roles, different content */}
      <Tab.Screen
        name="RequestsTab"
        component={isProvider ? ProviderRequestsStackNavigator : ClientRequestsStackNavigator}
        options={({ route }) => ({
          tabBarLabel: 'Requests',
          tabBarStyle: getTabBarStyle(route, insets.bottom),
          tabBarIcon: ({ focused, color }: TabBarIconProps) => (
            <TabIcon focused={focused}>
              <ClockIcon color={color} size={22} />
            </TabIcon>
          ),
        })}
      />

      {/* Calendar — provider only */}
      {isProvider && (
        <Tab.Screen
          name="CalendarTab"
          component={CalendarScreen}
          options={{
            tabBarLabel: 'Calendar',
            tabBarIcon: ({ focused, color }: TabBarIconProps) => (
              <TabIcon focused={focused}>
                <CalendarIcon color={color} size={22} />
              </TabIcon>
            ),
          }}
        />
      )}

      {/* Profile — both roles */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }: TabBarIconProps) => (
            <TabIcon focused={focused}>
              <ProfileIcon color={color} size={22} />
            </TabIcon>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 48,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  tabIconFocused: {
    backgroundColor: colors.primary[50],
  },
});
