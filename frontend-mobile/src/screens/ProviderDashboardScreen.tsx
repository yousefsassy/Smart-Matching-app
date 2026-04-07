import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { getServiceCategoryLabel, getServiceCategoryMeta } from '../constants/serviceCategories';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useServiceRequests } from '../context/ServiceRequestContext';
import { HomeStackParamList } from '../navigation/MainTabs';
import { formatBudgetRange } from '../utils/formatters';
import Avatar from '../components/Avatar';
import EditorialSectionHeader from '../components/editorial/EditorialSectionHeader';
import MetricPill from '../components/editorial/MetricPill';
import ToggleSwitch from '../components/ToggleSwitch';
import {
  BellIcon,
  ChevronRightIcon,
  ClockIcon,
} from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function ProviderDashboardScreen() {
  const { user, updateUser } = useAuth();
  const { getProviderRequests, refresh } = useServiceRequests();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);

  const allRequests = getProviderRequests();
  const firstName = user?.fullName?.split(' ')[0] || 'User';
  const businessName = user?.businessName || 'Your service profile';

  const pendingRequests = allRequests
    .filter((request) => request.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const acceptedCount = allRequests.filter((request) => request.status === 'accepted').length;
  const inProgressCount = allRequests.filter((request) => request.status === 'in_progress').length;
  const completedCount = allRequests.filter((request) => request.status === 'completed').length;

  useEffect(() => {
    setIsAvailable(user?.isAvailable ?? true);
  }, [user?.isAvailable]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleAvailabilityToggle = async (value: boolean) => {
    setIsAvailable(value);

    try {
      await updateUser({ isAvailable: value });
    } catch {
      setIsAvailable(!value);
      Alert.alert('Update failed', 'Could not update availability right now.');
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing['5xl'] }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.amber}
            colors={[colors.accent.amber]}
          />
        }
      >
        <LinearGradient
          colors={colors.gradients.hero as [string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.base }]}
        >
          <View style={styles.heroGlowLarge} />
          <View style={styles.heroGlowSmall} />

          <View style={styles.heroTopRow}>
            <View style={styles.availabilityCard}>
              <View style={styles.availabilityCopy}>
                <Text style={styles.availabilityEyebrow}>Availability</Text>
                <Text
                  style={[
                    styles.availabilityText,
                    { color: isAvailable ? colors.successLight : colors.errorLight },
                  ]}
                >
                  {isAvailable ? 'Available for new requests' : 'Unavailable right now'}
                </Text>
              </View>
              <ToggleSwitch
                value={isAvailable}
                onValueChange={handleAvailabilityToggle}
                activeColor={colors.success}
                inactiveColor={colors.error}
              />
            </View>

            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => Alert.alert('Notifications', 'You have 5 new notifications')}
            >
              <BellIcon size={18} color={colors.neutral[0]} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>{getGreeting()}</Text>
            <Text style={styles.heroTitle}>{businessName}</Text>
            <Text style={styles.heroDeck}>{firstName}, review incoming leads and keep work moving.</Text>
          </View>

          <View style={styles.heroMetrics}>
            <MetricPill value={String(pendingRequests.length).padStart(2, '0')} label="Incoming" />
            <MetricPill value={String(acceptedCount).padStart(2, '0')} label="Accepted" />
            <MetricPill value={String(inProgressCount).padStart(2, '0')} label="In progress" />
            <MetricPill value={String(completedCount).padStart(2, '0')} label="Completed" />
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <EditorialSectionHeader
            eyebrow="Queue"
            title="New requests"
            actionLabel="See all"
            onActionPress={() => navigation.navigate('IncomingRequests')}
          />

          {pendingRequests.length === 0 ? (
            <View style={styles.emptyListPanel}>
              <ClockIcon size={28} color={colors.primary[500]} />
              <Text style={styles.emptyListTitle}>No new requests yet</Text>
              <Text style={styles.emptyListText}>
                New service requests from clients will appear here when they match your setup.
              </Text>
            </View>
          ) : (
            <View style={styles.requestsList}>
              {pendingRequests.slice(0, 5).map((request) => (
                <TouchableOpacity
                  key={request.id}
                  style={styles.requestCard}
                  onPress={() => navigation.navigate('IncomingRequests')}
                  activeOpacity={0.84}
                >
                  <Avatar name={request.clientName} size="md" role="client" />
                  <View style={styles.requestCardBody}>
                    <Text style={styles.requestClientName}>{request.clientName}</Text>
                    <Text style={styles.requestService}>
                      {getServiceCategoryMeta(request.serviceCategory).emoji}{' '}
                      {getServiceCategoryLabel(request.serviceCategory)}
                    </Text>
                    {request.budget ? (
                      <Text style={styles.requestBudget}>
                        Budget: {formatBudgetRange(request.budget)}
                      </Text>
                    ) : null}
                  </View>
                  <ChevronRightIcon size={16} color={colors.neutral[400]} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface.base,
  },
  scrollView: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
    overflow: 'hidden',
    position: 'relative',
  },
  heroGlowLarge: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(21,122,115,0.14)',
    top: -130,
    right: -100,
  },
  heroGlowSmall: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: 20,
    left: -40,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['3xl'],
  },
  availabilityCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginRight: spacing.md,
  },
  availabilityCopy: {
    flex: 1,
  },
  availabilityEyebrow: {
    ...typography.role.eyebrow,
    color: 'rgba(255,255,255,0.62)',
    marginBottom: 2,
  },
  availabilityText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.coral,
  },
  heroCopy: {
    gap: spacing.md,
    marginBottom: spacing.xl,
    maxWidth: 320,
  },
  heroEyebrow: {
    ...typography.role.eyebrow,
    color: colors.accent.amber,
  },
  heroTitle: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.9,
    color: colors.neutral[0],
    fontWeight: typography.weight.bold,
  },
  heroDeck: {
    ...typography.role.deck,
    color: 'rgba(255,255,255,0.72)',
  },
  heroMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  body: {
    paddingTop: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing['2xl'],
  },
  emptyListPanel: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
    borderRadius: 30,
    backgroundColor: colors.surface.raised,
    gap: spacing.sm,
  },
  emptyListTitle: {
    fontSize: typography.size.md,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
  },
  emptyListText: {
    ...typography.role.body,
    color: colors.neutral[500],
    textAlign: 'center',
    maxWidth: 260,
  },
  requestsList: {
    gap: spacing.md,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.raised,
    borderRadius: 26,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  requestCardBody: {
    flex: 1,
    gap: 4,
  },
  requestClientName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.primary[900],
  },
  requestService: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
    fontWeight: typography.weight.medium,
  },
  requestBudget: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
  },
});
