import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useServiceRequests } from '../context/ServiceRequestContext';
import { HomeStackParamList } from '../navigation/MainTabs';
import { ServiceRequest, ServiceRequestStatus } from '../types/serviceRequest';
import Avatar from '../components/Avatar';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  BriefcaseIcon,
  ChevronRightIcon,
} from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

type FilterTab = 'new' | 'accepted' | 'completed';

const FILTER_TABS: { key: FilterTab; label: string; statuses: ServiceRequestStatus[]; color: string }[] = [
  { key: 'new', label: 'New', statuses: ['pending'], color: colors.accent.gold },
  { key: 'accepted', label: 'Accepted', statuses: ['accepted'], color: colors.accent.cyan },
  { key: 'completed', label: 'Completed', statuses: ['completed'], color: colors.success },
];

const STATUS_BORDER: Record<string, string> = {
  pending: colors.accent.gold,
  accepted: colors.accent.cyan,
  completed: colors.success,
};

const CATEGORY_EMOJI: Record<string, string> = {
  plumbing: '🔧', electrical: '⚡', cleaning: '🧹',
  gardening: '🌿', painting: '🎨', carpentry: '🪚', moving: '📦', other: '⚙️',
};

export default function ManageServiceRequestsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { getProviderRequests, acceptRequest, rejectRequest, updateRequestStatus, refresh } =
    useServiceRequests();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('new');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = () => {
    const providerRequests = getProviderRequests();
    const currentTab = FILTER_TABS.find((tab) => tab.key === activeTab);
    const filtered = providerRequests.filter((req) =>
      currentTab?.statuses.includes(req.status)
    );
    setRequests(
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    loadRequests();
    setRefreshing(false);
  };

  const handleAccept = async (requestId: string) => {
    Alert.alert('Accept Request', 'Do you want to accept this service request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: async () => {
          try {
            setProcessingId(requestId);
            await acceptRequest(requestId);
            Alert.alert('Success', 'Request accepted successfully!');
            loadRequests();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to accept request');
          } finally { setProcessingId(null); }
        },
      },
    ]);
  };

  const handleReject = async (requestId: string) => {
    Alert.alert('Reject Request', 'Are you sure you want to reject this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive',
        onPress: async () => {
          try {
            setProcessingId(requestId);
            await rejectRequest(requestId, 'Provider declined the request');
            Alert.alert('Request Rejected', 'The client has been notified.');
            loadRequests();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to reject request');
          } finally { setProcessingId(null); }
        },
      },
    ]);
  };

  const handleMarkCompleted = async (requestId: string) => {
    Alert.alert('Mark as Completed', 'Have you completed this service? The client will be notified.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          try {
            setProcessingId(requestId);
            await updateRequestStatus(requestId, 'completed');
            Alert.alert('Success', 'Request marked as completed!');
            loadRequests();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update status');
          } finally { setProcessingId(null); }
        },
      },
    ]);
  };

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const activeTabConfig = FILTER_TABS.find((t) => t.key === activeTab)!;

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
        <View style={styles.headerProviderBadge}>
          <BriefcaseIcon size={12} color="rgba(255,255,255,0.85)" />
          <Text style={styles.headerProviderBadgeText}>PROVIDER</Text>
        </View>
        <Text style={styles.headerTitle}>Service Requests</Text>
        <View style={styles.headerCountPill}>
          <Text style={styles.headerCountText}>{requests.length} {activeTab.replace('_', ' ')}</Text>
        </View>
      </LinearGradient>

      {/* ── Filter chips ─────────────────────────────────────────────────────── */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = getProviderRequests().filter((r) => tab.statuses.includes(r.status)).length;

            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
                style={[styles.filterChip, isActive && { borderColor: tab.color }]}
              >
                <View style={[
                  styles.filterChipDot,
                  { backgroundColor: isActive ? tab.color : colors.neutral[300] },
                ]} />
                <Text style={[
                  styles.filterChipText,
                  isActive && { color: tab.color, fontWeight: typography.weight.bold },
                ]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[
                    styles.filterChipBadge,
                    { backgroundColor: isActive ? tab.color : colors.neutral[100] },
                  ]}>
                    <Text style={[
                      styles.filterChipBadgeText,
                      { color: isActive ? colors.neutral[0] : colors.neutral[600] },
                    ]}>
                      {count}
                    </Text>
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
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <ClockIcon size={40} color={colors.primary[400]} />
            </View>
            <Text style={styles.emptyTitle}>No {activeTab.replace('_', ' ')} requests</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'new' && 'New service requests will appear here'}
              {activeTab === 'accepted' && 'Accepted requests will appear here'}
              {activeTab === 'completed' && 'Completed requests will appear here'}
            </Text>
          </View>
        ) : (
          <View style={styles.requestsList}>
            {requests.map((request) => {
              const isProcessing = processingId === request.id;
              return (
                <View key={request.id} style={styles.requestCard}>
                  {/* Status left border */}
                  <View style={[
                    styles.requestAccent,
                    { backgroundColor: STATUS_BORDER[request.status] || colors.neutral[300] },
                  ]} />

                  <View style={styles.requestBody}>
                    {/* Client info + category */}
                    <View style={styles.requestTop}>
                      <Avatar name={request.clientName} size="sm" role="client" />
                      <View style={styles.requestTitleBlock}>
                        <Text style={styles.clientName}>{request.clientName}</Text>
                        <Text style={styles.requestDate}>{formatDate(request.createdAt)}</Text>
                      </View>
                      <View style={styles.categoryEmojiWrap}>
                        <Text style={styles.categoryEmoji}>
                          {CATEGORY_EMOJI[request.serviceCategory] || '⚙️'}
                        </Text>
                      </View>
                    </View>

                    {/* Service name + description */}
                    <Text style={styles.serviceCategory}>
                      {request.serviceCategory.charAt(0).toUpperCase() + request.serviceCategory.slice(1)}
                    </Text>
                    <Text style={styles.description} numberOfLines={2}>
                      {request.description}
                    </Text>

                    {/* Meta details */}
                    <View style={styles.detailsRow}>
                      <View style={styles.detailItem}>
                        <MapPinIcon size={11} color={colors.neutral[400]} />
                        <Text style={styles.detailText} numberOfLines={1}>
                          {request.location.address}
                        </Text>
                      </View>
                      {request.budget && (
                        <>
                          <View style={styles.detailDot} />
                          <View style={styles.detailItem}>
                            <TagIcon size={11} color={colors.neutral[400]} />
                            <Text style={styles.detailText}>
                              ${request.budget.min}–${request.budget.max}
                            </Text>
                          </View>
                        </>
                      )}
                    </View>

                    {/* Action buttons */}
                    {isProcessing ? (
                      <View style={styles.loadingRow}>
                        <ActivityIndicator size="small" color={colors.primary[600]} />
                        <Text style={styles.loadingText}>Processing...</Text>
                      </View>
                    ) : (
                      <View style={styles.actionsRow}>
                        {request.status === 'pending' && (
                          <>
                            <TouchableOpacity
                              style={styles.rejectBtn}
                              onPress={() => handleReject(request.id)}
                              activeOpacity={0.8}
                            >
                              <XCircleIcon size={15} color={colors.error} />
                              <Text style={styles.rejectBtnText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleAccept(request.id)}
                              activeOpacity={0.8}
                              style={{ flex: 1, borderRadius: borderRadius.full, overflow: 'hidden' }}
                            >
                              <LinearGradient
                                colors={colors.gradients.primary as [string, string]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.acceptBtn}
                              >
                                <CheckCircleIcon size={15} color={colors.neutral[0]} />
                                <Text style={styles.acceptBtnText}>Accept</Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          </>
                        )}

                        {request.status === 'accepted' && (
                          <TouchableOpacity
                            onPress={() => handleMarkCompleted(request.id)}
                            activeOpacity={0.8}
                            style={{ flex: 1, borderRadius: borderRadius.full, overflow: 'hidden' }}
                          >
                            <LinearGradient
                              colors={['#10B981', '#059669']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={styles.acceptBtn}
                            >
                              <CheckCircleIcon size={15} color={colors.neutral[0]} />
                              <Text style={styles.acceptBtnText}>Mark Completed</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        )}

                        {request.status === 'completed' && request.rating && (
                          <View style={styles.ratingPill}>
                            <Text style={styles.ratingPillText}>⭐ Rated {request.rating}/5</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
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
    gap: spacing.sm,
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
  headerProviderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
  },
  headerProviderBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: typography.letterSpacing.wider,
  },
  headerTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    letterSpacing: typography.letterSpacing.tight,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    backgroundColor: colors.neutral[0],
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  filterChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterChipText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[600],
  },
  filterChipBadge: {
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
  },

  // ── Scroll
  scrollView: {
    flex: 1,
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
    maxWidth: 240,
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
  requestTitleBlock: {
    flex: 1,
  },
  clientName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
  },
  requestDate: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
  },
  categoryEmojiWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  serviceCategory: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.primary[700],
    letterSpacing: typography.letterSpacing.tight,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
    lineHeight: typography.lineHeight.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  detailText: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    flex: 1,
  },
  detailDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.neutral[300],
  },

  // ── Actions
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  rejectBtnText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.error,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  acceptBtnText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
  ratingPill: {
    flex: 1,
    backgroundColor: colors.accent.goldLight,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  ratingPillText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.accent.gold,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
  },
});
