import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useServiceRequests } from '../context/ServiceRequestContext';
import { HomeStackParamList } from '../navigation/MainTabs';
import { ServiceRequest, ServiceRequestStatus } from '../types/serviceRequest';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import {
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  ChevronRightIcon,
  SparkleIcon,
} from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const CATEGORY_EMOJI: Record<string, string> = {
  plumbing: '🔧',
  electrical: '⚡',
  cleaning: '🧹',
  gardening: '🌿',
  painting: '🎨',
  carpentry: '🪚',
  moving: '📦',
  other: '⚙️',
};

const CATEGORY_COLORS: Record<string, [string, string]> = {
  plumbing: [colors.primary[500], colors.primary[700]],
  electrical: [colors.accent.mustard, '#F59500'],
  cleaning: [colors.accent.cyan, colors.primary[600]],
  gardening: ['#22C55E', '#16A34A'],
  painting: [colors.accent.coral, '#C0331F'],
  carpentry: ['#A16207', '#78420A'],
  moving: [colors.primary[400], colors.primary[600]],
  other: [colors.neutral[500], colors.neutral[700]],
};

const STATUS_BORDER: Record<string, string> = {
  pending: colors.accent.gold,
  accepted: colors.accent.cyan,
  completed: colors.success,
};

type FilterKey = 'all' | 'pending' | 'accepted' | 'completed';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'completed', label: 'Completed' },
];

export default function MyRequestsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { getClientRequests, refresh } = useServiceRequests();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const VISIBLE_STATUSES = ['pending', 'accepted', 'completed'];

  useEffect(() => {
    loadRequests();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadRequests();
    }, [])
  );

  const loadRequests = () => {
    const clientRequests = getClientRequests();
    setRequests(
      clientRequests
        .filter((r) => VISIBLE_STATUSES.includes(r.status))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    loadRequests();
    setRefreshing(false);
  };

  const filteredRequests = activeFilter === 'all'
    ? requests
    : requests.filter((r) => r.status === activeFilter);

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.root}>

      {/* ── Gradient Header ──────────────────────────────────────────────────── */}
      <LinearGradient
        colors={['#0A2744', '#134686', '#1a5699']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.base }]}
      >
        <View style={styles.headerGlowCircle} />
        <Text style={styles.headerEyebrow}>MY REQUESTS</Text>
        <Text style={styles.headerTitle}>Service Requests</Text>
        <View style={styles.headerCountPill}>
          <Text style={styles.headerCountText}>{requests.length} total</Text>
        </View>
      </LinearGradient>

      {/* ── Filter chips ─────────────────────────────────────────────────────── */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            const count = f.key === 'all'
              ? requests.length
              : requests.filter((r) => r.status === f.key).length;

            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setActiveFilter(f.key)}
                activeOpacity={0.8}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                {isActive ? (
                  <LinearGradient
                    colors={colors.gradients.primary as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.filterChipGradient}
                  >
                    <Text style={styles.filterChipTextActive}>{f.label}</Text>
                    {count > 0 && (
                      <View style={styles.filterChipBadge}>
                        <Text style={styles.filterChipBadgeText}>{count}</Text>
                      </View>
                    )}
                  </LinearGradient>
                ) : (
                  <View style={styles.filterChipInner}>
                    <Text style={styles.filterChipText}>{f.label}</Text>
                    {count > 0 && (
                      <View style={styles.filterChipBadgeInactive}>
                        <Text style={styles.filterChipBadgeInactiveText}>{count}</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Request list ─────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[600]}
            colors={[colors.primary[600]]}
          />
        }
      >
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <ClockIcon size={40} color={colors.primary[400]} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeFilter === 'all' ? 'No requests yet' : `No ${activeFilter} requests`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? 'Create your first service request to find providers near you.'
                : `You have no requests with this status right now.`}
            </Text>
            {activeFilter === 'all' && (
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateRequest')}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={colors.gradients.primary as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emptyButton}
                >
                  <SparkleIcon size={16} color={colors.neutral[0]} />
                  <Text style={styles.emptyButtonText}>Create Request</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.requestsList}>
            {filteredRequests.map((request) => (
              <TouchableOpacity
                key={request.id}
                style={styles.requestCard}
                onPress={() => navigation.navigate('RequestDetail', { requestId: request.id })}
                activeOpacity={0.8}
              >
                {/* Status left border */}
                <View
                  style={[
                    styles.requestAccent,
                    { backgroundColor: STATUS_BORDER[request.status] || colors.neutral[300] },
                  ]}
                />

                <View style={styles.requestBody}>
                  {/* Top row */}
                  <View style={styles.requestTop}>
                    {/* Category icon */}
                    <LinearGradient
                      colors={CATEGORY_COLORS[request.serviceCategory] || [colors.neutral[400], colors.neutral[600]]}
                      style={styles.categoryIconWrap}
                    >
                      <Text style={styles.categoryEmoji}>
                        {CATEGORY_EMOJI[request.serviceCategory] || '⚙️'}
                      </Text>
                    </LinearGradient>

                    <View style={styles.requestTitleBlock}>
                      <Text style={styles.requestCategory}>
                        {request.serviceCategory.charAt(0).toUpperCase() + request.serviceCategory.slice(1)}
                      </Text>
                      <Text style={styles.requestDate}>{formatDate(request.createdAt)}</Text>
                    </View>

                    <StatusBadge status={request.status} />
                  </View>

                  {/* Description */}
                  <Text style={styles.requestDescription} numberOfLines={2}>
                    {request.description}
                  </Text>

                  {/* Meta row */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <MapPinIcon size={11} color={colors.neutral[400]} />
                      <Text style={styles.metaText} numberOfLines={1}>{request.location.address}</Text>
                    </View>
                    <View style={styles.metaDot} />
                    <View style={styles.metaItem}>
                      <CalendarIcon size={11} color={colors.neutral[400]} />
                      <Text style={styles.metaText}>{formatDate(request.timeSlot.date)}</Text>
                    </View>
                  </View>

                  {/* Provider (if assigned) */}
                  {request.assignedProviderName && (
                    <View style={styles.providerRow}>
                      <Avatar name={request.assignedProviderName} size="sm" role="provider" />
                      <Text style={styles.providerName}>{request.assignedProviderName}</Text>
                    </View>
                  )}

                  {/* Rating CTA */}
                  {request.status === 'completed' && !request.rating && (
                    <TouchableOpacity
                      style={styles.ratingCta}
                      onPress={() => navigation.navigate('RateProvider', { requestId: request.id })}
                    >
                      <StarIcon size={14} color={colors.accent.gold} />
                      <Text style={styles.ratingCtaText}>Rate this service</Text>
                      <ChevronRightIcon size={12} color={colors.accent.gold} />
                    </TouchableOpacity>
                  )}

                  {/* Rating display */}
                  {request.rating && (
                    <View style={styles.ratingDisplay}>
                      <StarIcon size={14} color={colors.accent.gold} filled />
                      <Text style={styles.ratingText}>Rated {request.rating}/5</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },

  // ── Header
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  headerGlowCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(38, 96, 175, 0.22)',
    top: -40,
    right: -20,
  },
  headerEyebrow: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: typography.letterSpacing.widest,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.sm,
  },
  headerCountPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerCountText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: 'rgba(255,255,255,0.85)',
  },

  // ── Filter chips
  filterWrapper: {
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    ...shadows.sm,
  },
  filterRow: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
  },
  filterChipActive: {
    borderColor: 'transparent',
  },
  filterChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    gap: spacing.xs,
  },
  filterChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    gap: spacing.xs,
  },
  filterChipText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[600],
  },
  filterChipTextActive: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
  filterChipBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterChipBadgeText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
  filterChipBadgeInactive: {
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterChipBadgeInactiveText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.neutral[600],
  },

  // ── Scroll
  scrollView: {
    flex: 1,
  },

  // ── Request list
  requestsList: {
    gap: spacing.md,
  },
  requestCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    overflow: 'hidden',
    ...shadows.card,
  },
  requestAccent: {
    width: 4,
  },
  requestBody: {
    flex: 1,
    padding: spacing.base,
    gap: spacing.sm,
  },
  requestTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  requestTitleBlock: {
    flex: 1,
  },
  requestCategory: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    letterSpacing: typography.letterSpacing.tight,
  },
  requestDate: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
  },
  requestDescription: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
    lineHeight: typography.lineHeight.sm,
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  metaText: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    flex: 1,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.neutral[300],
  },

  // Provider row
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  providerName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary[600],
  },

  // Rating
  ratingCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  ratingCtaText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.accent.gold,
    flex: 1,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  ratingText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[700],
  },

  // ── Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    gap: spacing.md,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.tight,
  },
  emptySubtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: typography.lineHeight.base,
    marginBottom: spacing.sm,
    maxWidth: 260,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.md,
  },
  emptyButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
});
