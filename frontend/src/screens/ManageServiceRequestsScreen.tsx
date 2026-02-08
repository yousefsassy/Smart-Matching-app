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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useServiceRequests } from '../context/ServiceRequestContext';
import { HomeStackParamList } from '../navigation/MainTabs';
import { ServiceRequest, ServiceRequestStatus } from '../types/serviceRequest';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
} from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

type FilterTab = 'new' | 'accepted' | 'in_progress' | 'completed';

const FILTER_TABS: { key: FilterTab; label: string; statuses: ServiceRequestStatus[] }[] = [
  { key: 'new', label: 'New', statuses: ['pending'] },
  { key: 'accepted', label: 'Accepted', statuses: ['accepted'] },
  { key: 'in_progress', label: 'In Progress', statuses: ['in_progress'] },
  { key: 'completed', label: 'Completed', statuses: ['completed'] },
];

export default function ManageServiceRequestsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { getProviderRequests, acceptRequest, rejectRequest, updateRequestStatus, refresh } =
    useServiceRequests();
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
    // Sort by most recent first
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
    Alert.alert(
      'Accept Request',
      'Do you want to accept this service request?',
      [
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
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (requestId: string) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(requestId);
              await rejectRequest(requestId, 'Provider declined the request');
              Alert.alert('Request Rejected', 'The client has been notified.');
              loadRequests();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reject request');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleMarkInProgress = async (requestId: string) => {
    try {
      setProcessingId(requestId);
      await updateRequestStatus(requestId, 'in_progress');
      Alert.alert('Status Updated', 'Request marked as in progress');
      loadRequests();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkCompleted = async (requestId: string) => {
    Alert.alert(
      'Mark as Completed',
      'Have you completed this service? The client will be notified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              setProcessingId(requestId);
              await updateRequestStatus(requestId, 'completed');
              Alert.alert(
                'Success',
                'Request marked as completed! The client can now rate your service.'
              );
              loadRequests();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update status');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <ClockIcon size={64} color={colors.neutral[300]} />
      </View>
      <Text style={styles.emptyTitle}>No {activeTab.replace('_', ' ')} requests</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'new' && 'New service requests will appear here'}
        {activeTab === 'accepted' && 'Accepted requests will appear here'}
        {activeTab === 'in_progress' && 'In progress requests will appear here'}
        {activeTab === 'completed' && 'Completed requests will appear here'}
      </Text>
    </View>
  );

  const renderRequestCard = (request: ServiceRequest) => {
    const isProcessing = processingId === request.id;

    return (
      <View key={request.id} style={styles.requestCard}>
        {/* Client Info */}
        <View style={styles.clientInfo}>
          <View style={styles.clientAvatar}>
            <UserIcon size={20} color={colors.primary[600]} />
          </View>
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>{request.clientName}</Text>
            <Text style={styles.requestDate}>{formatDate(request.createdAt)}</Text>
          </View>
        </View>

        {/* Service Info */}
        <Text style={styles.serviceCategory}>
          {request.serviceCategory.charAt(0).toUpperCase() +
            request.serviceCategory.slice(1)}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {request.description}
        </Text>

        {/* Request Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <MapPinIcon size={14} color={colors.neutral[500]} />
            <Text style={styles.detailText} numberOfLines={1}>
              {request.location.address}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <CalendarIcon size={14} color={colors.neutral[500]} />
            <Text style={styles.detailText}>
              {request.timeSlot.date} • {request.timeSlot.startTime}
            </Text>
          </View>
          {request.budget && (
            <View style={styles.detailRow}>
              <TagIcon size={14} color={colors.neutral[500]} />
              <Text style={styles.detailText}>
                ${request.budget.min}-${request.budget.max}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {isProcessing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary[600]} />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        ) : (
          <View style={styles.actionsRow}>
            {request.status === 'pending' && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(request.id)}
                  activeOpacity={0.8}
                >
                  <XCircleIcon size={18} color={colors.error} />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAccept(request.id)}
                  activeOpacity={0.8}
                >
                  <CheckCircleIcon size={18} color={colors.neutral[0]} />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </>
            )}

            {request.status === 'accepted' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => handleMarkInProgress(request.id)}
                activeOpacity={0.8}
              >
                <ClockIcon size={18} color={colors.neutral[0]} />
                <Text style={styles.primaryButtonText}>Start Job</Text>
              </TouchableOpacity>
            )}

            {request.status === 'in_progress' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.successButton]}
                onPress={() => handleMarkCompleted(request.id)}
                activeOpacity={0.8}
              >
                <CheckCircleIcon size={18} color={colors.neutral[0]} />
                <Text style={styles.successButtonText}>Mark Completed</Text>
              </TouchableOpacity>
            )}

            {request.status === 'completed' && request.rating && (
              <View style={styles.ratingDisplay}>
                <Text style={styles.ratingText}>
                  Rated {request.rating}/5 ⭐
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Service Requests</Text>
        <Text style={styles.subtitle}>{requests.length} requests</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Requests List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        {requests.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.requestsList}>
            {requests.map(renderRequestCard)}
          </View>
        )}

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },
  tabsContainer: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  tabsContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
  },
  tabActive: {
    backgroundColor: colors.primary[600],
  },
  tabText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[600],
  },
  tabTextActive: {
    color: colors.neutral[0],
    fontWeight: typography.weight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  requestsList: {
    paddingHorizontal: spacing.xl,
  },
  requestCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[900],
  },
  requestDate: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
  },
  serviceCategory: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.neutral[700],
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  detailsContainer: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  rejectButton: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  rejectButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.error,
  },
  acceptButton: {
    backgroundColor: colors.primary[600],
  },
  acceptButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
  },
  primaryButton: {
    backgroundColor: colors.primary[600],
  },
  primaryButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
  },
  successButton: {
    backgroundColor: colors.success,
  },
  successButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
  },
  ratingDisplay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  ratingText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.accent.gold,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['4xl'],
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.size.base,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
