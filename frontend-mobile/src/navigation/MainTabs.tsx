import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute, RouteProp } from '@react-navigation/native';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  TawTawMarkIcon,
} from '../components/Icons';
import { colors, borderRadius, typography } from '../theme';
import {
  LocationPickerRouteParams,
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
  if (focused) {
    return (
      <LinearGradient
        colors={colors.gradients.cardHero as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.tabIcon, styles.tabIconFocused]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={styles.tabIcon}>
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
    backgroundColor: colors.surface.base,
    borderTopWidth: 0,
    height: 82 + insetsBottom,
    paddingTop: 12,
    paddingBottom: insetsBottom + 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary[900],
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
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
          backgroundColor: colors.surface.base,
          borderTopWidth: 0,
          height: 82 + insets.bottom,
          paddingTop: 12,
          paddingBottom: insets.bottom + 12,
          ...Platform.select({
            ios: {
              shadowColor: colors.primary[900],
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
            },
            android: {
              elevation: 16,
            },
          }),
        },
        tabBarActiveTintColor: colors.primary[700],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarLabelStyle: {
          fontSize: typography.size.xs,
          fontWeight: typography.weight.semibold,
          marginTop: 3,
          letterSpacing: 0.25,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <View style={styles.tabBarBrandMark}>
              <TawTawMarkIcon size={22} />
            </View>
          </View>
        ),
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
              <HomeIcon color={focused ? colors.neutral[0] : color} size={22} />
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
              <ClockIcon color={focused ? colors.neutral[0] : color} size={22} />
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
                <CalendarIcon color={focused ? colors.neutral[0] : color} size={22} />
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
              <ProfileIcon color={focused ? colors.neutral[0] : color} size={22} />
            </TabIcon>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 52,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  tabIconFocused: {
    shadowColor: colors.primary[700],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  tabBarBackground: {
    flex: 1,
    backgroundColor: colors.surface.base,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabBarBrandMark: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    opacity: 0.08,
  },
});
