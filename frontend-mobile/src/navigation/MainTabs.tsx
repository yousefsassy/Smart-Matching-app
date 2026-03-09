import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import ClientDashboardScreen from '../screens/ClientDashboardScreen';
import ProviderDashboardScreen from '../screens/ProviderDashboardScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateServiceRequestScreen from '../screens/CreateServiceRequestScreen';
import MyRequestsScreen from '../screens/MyRequestsScreen';
import RequestDetailScreen from '../screens/RequestDetailScreen';
import RateProviderScreen from '../screens/RateProviderScreen';
import ManageServiceRequestsScreen from '../screens/ManageServiceRequestsScreen';
import { SearchIcon, BriefcaseIcon, CalendarIcon, ClockIcon } from '../components/Icons';
import { colors, borderRadius, shadows, typography } from '../theme';
import { HomeIcon, MatchIcon, MessageIcon, ProfileIcon } from '../components/Icons';

export type MainTabParamList = {
  HomeTab: undefined;
  RequestsTab: undefined;
  MatchesTab: undefined;
  MessagesTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  FindMatches: undefined;
  MyRequests: undefined;
  SavedProviders: undefined;
  IncomingRequests: undefined;
  MyServices: undefined;
  Availability: undefined;
  CreateRequest: undefined;
  RequestDetail: { requestId: string };
  RateProvider: { requestId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const RequestsStack = createNativeStackNavigator<HomeStackParamList>();

// Wrapper components for PlaceholderScreen
const FindMatchesScreen = () => (
  <PlaceholderScreen title="Find Matches" icon={<SearchIcon size={48} color={colors.neutral[0]} />} />
);
const SavedProvidersScreen = () => (
  <PlaceholderScreen title="Saved Providers" />
);
const MyServicesScreen = () => (
  <PlaceholderScreen title="My Services" icon={<BriefcaseIcon size={48} color={colors.neutral[0]} />} />
);
const AvailabilityScreen = () => (
  <PlaceholderScreen title="Availability" icon={<CalendarIcon size={48} color={colors.neutral[0]} />} />
);

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
      <HomeStack.Screen name="FindMatches" component={FindMatchesScreen} />
      <HomeStack.Screen name="MyRequests" component={MyRequestsScreen} />
      <HomeStack.Screen name="SavedProviders" component={SavedProvidersScreen} />
      <HomeStack.Screen name="IncomingRequests" component={ManageServiceRequestsScreen} />
      <HomeStack.Screen name="MyServices" component={MyServicesScreen} />
      <HomeStack.Screen name="Availability" component={AvailabilityScreen} />
      <HomeStack.Screen name="CreateRequest" component={CreateServiceRequestScreen} options={{ animation: 'fade_from_bottom' }} />
      <HomeStack.Screen name="RequestDetail" component={RequestDetailScreen} />
      <HomeStack.Screen name="RateProvider" component={RateProviderScreen} options={{ animation: 'slide_from_bottom' }} />
    </HomeStack.Navigator>
  );
}

function RequestsStackNavigator() {
  return (
    <RequestsStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[50] },
        animation: 'slide_from_right',
      }}
    >
      <RequestsStack.Screen name="MyRequests" component={MyRequestsScreen} />
      <RequestsStack.Screen name="CreateRequest" component={CreateServiceRequestScreen} options={{ animation: 'fade_from_bottom' }} />
      <RequestsStack.Screen name="RequestDetail" component={RequestDetailScreen} />
      <RequestsStack.Screen name="RateProvider" component={RateProviderScreen} options={{ animation: 'slide_from_bottom' }} />
    </RequestsStack.Navigator>
  );
}

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isClient = user?.role === 'client';

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
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }: TabBarIconProps) => (
            <TabIcon focused={focused}>
              <HomeIcon color={color} size={22} />
            </TabIcon>
          ),
        }}
      />
      {isClient && (
        <Tab.Screen
          name="RequestsTab"
          component={RequestsStackNavigator}
          options={{
            tabBarLabel: 'Requests',
            tabBarIcon: ({ focused, color }: TabBarIconProps) => (
              <TabIcon focused={focused}>
                <ClockIcon color={color} size={22} />
              </TabIcon>
            ),
          }}
        />
      )}
      <Tab.Screen
        name="MatchesTab"
        component={() => <PlaceholderScreen title="Matches" icon={<MatchIcon size={48} color={colors.neutral[0]} />} />}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({ focused, color }: TabBarIconProps) => (
            <TabIcon focused={focused}>
              <MatchIcon color={color} size={22} />
            </TabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={() => <PlaceholderScreen title="Messages" icon={<MessageIcon size={48} color={colors.neutral[0]} />} />}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ focused, color }: TabBarIconProps) => (
            <TabIcon focused={focused}>
              <MessageIcon color={color} size={22} />
            </TabIcon>
          ),
          tabBarBadge: 3,
          tabBarBadgeStyle: {
            backgroundColor: colors.accent.coral,
            color: colors.neutral[0],
            fontSize: 10,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            lineHeight: 18,
          },
        }}
      />
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