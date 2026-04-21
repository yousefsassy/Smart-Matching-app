import React, { useState } from 'react';
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
import {
  VISIBLE_SERVICE_CATEGORY_OPTIONS,
  getServiceCategoryLabel,
} from '../constants/serviceCategories';
import { getStatusBorderColor } from '../constants/statusConfig';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useServiceRequests } from '../context/ServiceRequestContext';
import { HomeStackParamList } from '../navigation/MainTabs';
import StatusBadge from '../components/StatusBadge';
import { ServiceRequest } from '../types/serviceRequest';
import EditorialSectionHeader from '../components/editorial/EditorialSectionHeader';
import MetricPill from '../components/editorial/MetricPill';
import {
  BellIcon,
  ChevronRightIcon,
  MapPinIcon,
  SearchIcon,
  CalendarIcon,
  TawTawMarkIcon,
} from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const MOCK_LOCATION = 'Tunis, Tunisia';
const SERVICE_CATEGORIES = VISIBLE_SERVICE_CATEGORY_OPTIONS;

export default function ClientDashboardScreen() {
  const { user } = useAuth();
  const { getClientRequests, refresh } = useServiceRequests();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const requests = getClientRequests();
  const firstName = user?.fullName?.split(' ')[0] || 'there';

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  const activeCount = requests.filter((request) => request.status !== 'completed').length;
  const completedCount = requests.filter((request) => request.status === 'completed').length;

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
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
            <View style={styles.locationPill}>
              <MapPinIcon size={13} color={colors.neutral[0]} />
              <Text style={styles.locationText}>{MOCK_LOCATION}</Text>
            </View>

            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => Alert.alert('Notifications', 'You have 3 new notifications')}
            >
              <BellIcon size={18} color={colors.neutral[0]} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>{firstName}, what do you need today?</Text>
          </View>

          <View style={styles.heroMetrics}>
            <MetricPill value={String(requests.length).padStart(2, '0')} label="All requests" />
            <MetricPill value={String(activeCount).padStart(2, '0')} label="In motion" />
            <MetricPill value={String(completedCount).padStart(2, '0')} label="Completed" />
          </View>

          <TouchableOpacity
            style={styles.conciergeCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('CreateRequest')}
          >
            <View style={styles.conciergeHeader}>
              <View style={styles.conciergeMark}>
                <TawTawMarkIcon size={22} />
              </View>
              <View style={styles.conciergeSearchWrap}>
                <SearchIcon size={16} color={colors.primary[700]} />
              </View>
            </View>
            <Text style={styles.conciergeEyebrow}>Request</Text>
            <Text style={styles.conciergeTitle}>Post a new service request</Text>
            <View style={styles.conciergeFooter}>
              <Text style={styles.conciergeFooterText}>Start</Text>
              <ChevronRightIcon size={15} color={colors.primary[900]} />
            </View>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.body}>
          <EditorialSectionHeader
            eyebrow="Categories"
            title="Find the right service"
            actionLabel="Open request"
            onActionPress={() => navigation.navigate('CreateRequest')}
          />

          <View style={styles.categoryGrid}>
            {SERVICE_CATEGORIES.map((item, index) => {
              const isFeatured = index === 0;

              return (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => navigation.navigate('CreateRequest')}
                  activeOpacity={0.84}
                  style={[styles.categoryCard, isFeatured && styles.categoryCardFeatured]}
                >
                  <LinearGradient
                    colors={item.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.categoryGlow, isFeatured && styles.categoryGlowFeatured]}
                  />
                  <Text style={styles.categoryEmoji}>{item.emoji}</Text>
                  <Text style={styles.categoryLabel}>{item.label}</Text>
                  <Text style={styles.categoryMeta}>
                    {isFeatured ? 'Popular now' : 'Browse'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <EditorialSectionHeader
            eyebrow="Recent"
            title="Latest requests"
            actionLabel="See all"
            onActionPress={() => navigation.getParent()?.navigate('RequestsTab')}
          />

          {recentRequests.length === 0 ? (
            <View style={styles.emptyPanel}>
              <Text style={styles.emptyEyebrow}>No requests yet</Text>
              <Text style={styles.emptyTitle}>Start with your first request.</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateRequest')}
                style={styles.emptyAction}
                activeOpacity={0.86}
              >
                <Text style={styles.emptyActionText}>Post first request</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.requestsList}>
              {recentRequests.map((request: ServiceRequest) => (
                <TouchableOpacity
                  key={request.id}
                  style={styles.requestCard}
                  onPress={() => navigation.navigate('RequestDetail', { requestId: request.id })}
                  activeOpacity={0.84}
                >
                  <View
                    style={[
                      styles.requestAccent,
                      { backgroundColor: getStatusBorderColor(request.status) },
                    ]}
                  />
                  <View style={styles.requestBody}>
                    <View style={styles.requestHeader}>
                      <Text style={styles.requestCategory}>
                        {getServiceCategoryLabel(request.serviceCategory)}
                      </Text>
                      <StatusBadge status={request.status} />
                    </View>

                    <Text style={styles.requestDescription} numberOfLines={2}>
                      {request.description}
                    </Text>

                    <View style={styles.requestMeta}>
                      <View style={styles.requestMetaItem}>
                        <MapPinIcon size={11} color={colors.neutral[500]} />
                        <Text style={styles.requestMetaText} numberOfLines={1}>
                          {request.requestLocation.addressLabel}
                        </Text>
                      </View>
                      <View style={styles.requestMetaItem}>
                        <CalendarIcon size={11} color={colors.neutral[500]} />
                        <Text style={styles.requestMetaText}>{formatDate(request.createdAt)}</Text>
                      </View>
                    </View>
                  </View>
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
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlowLarge: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(207,152,49,0.12)',
    top: -120,
    right: -120,
  },
  heroGlowSmall: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: 70,
    left: -30,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  locationText: {
    fontSize: typography.size.sm,
    color: colors.neutral[0],
    fontWeight: typography.weight.semibold,
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
    maxWidth: 340,
    marginBottom: spacing.xl,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.9,
    color: colors.neutral[0],
    fontWeight: typography.weight.bold,
  },
  heroMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  conciergeCard: {
    alignSelf: 'flex-end',
    width: '92%',
    padding: spacing.xl,
    borderRadius: 30,
    backgroundColor: colors.surface.raised,
    ...shadows.xl,
  },
  conciergeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  conciergeMark: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.primary[900],
    justifyContent: 'center',
    alignItems: 'center',
  },
  conciergeSearchWrap: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conciergeEyebrow: {
    ...typography.role.eyebrow,
    color: colors.primary[500],
    marginBottom: spacing.sm,
  },
  conciergeTitle: {
    fontSize: typography.size['2xl'],
    lineHeight: typography.lineHeight['2xl'],
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.75,
    marginBottom: spacing.xl,
  },
  conciergeFooter: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.amberLight,
  },
  conciergeFooterText: {
    fontSize: typography.size.sm,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
  },
  body: {
    paddingTop: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing['2xl'],
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryCard: {
    width: '48%',
    minHeight: 150,
    borderRadius: 26,
    padding: spacing.lg,
    backgroundColor: colors.surface.raised,
    overflow: 'hidden',
    ...shadows.card,
  },
  categoryCardFeatured: {
    width: '100%',
    minHeight: 186,
  },
  categoryGlow: {
    position: 'absolute',
    right: -18,
    top: -12,
    width: 96,
    height: 96,
    borderRadius: 48,
    opacity: 0.22,
  },
  categoryGlowFeatured: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: spacing.lg,
  },
  categoryLabel: {
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.lg,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.45,
    marginBottom: spacing.xs,
  },
  categoryMeta: {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.base,
    color: colors.neutral[500],
  },
  emptyPanel: {
    padding: spacing.xl,
    borderRadius: 30,
    backgroundColor: colors.primary[900],
    ...shadows.lg,
  },
  emptyEyebrow: {
    ...typography.role.eyebrow,
    color: colors.accent.amber,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.xl,
    color: colors.neutral[0],
    fontWeight: typography.weight.bold,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  emptyBody: {
    ...typography.role.body,
    color: 'rgba(255,255,255,0.72)',
    marginBottom: spacing.lg,
  },
  emptyAction: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.amberLight,
  },
  emptyActionText: {
    fontSize: typography.size.sm,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
  },
  requestsList: {
    gap: spacing.md,
  },
  requestCard: {
    flexDirection: 'row',
    borderRadius: 26,
    backgroundColor: colors.surface.raised,
    overflow: 'hidden',
    ...shadows.card,
  },
  requestAccent: {
    width: 6,
  },
  requestBody: {
    flex: 1,
    padding: spacing.lg,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  requestCategory: {
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
    color: colors.primary[900],
    fontWeight: typography.weight.bold,
    flex: 1,
    letterSpacing: -0.3,
  },
  requestDescription: {
    ...typography.role.body,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  requestMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  requestMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: '48%',
  },
  requestMetaText: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    fontWeight: typography.weight.medium,
    flexShrink: 1,
  },
});
