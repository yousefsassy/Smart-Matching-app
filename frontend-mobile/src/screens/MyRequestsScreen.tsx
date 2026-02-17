import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useServiceRequests } from '../context/ServiceRequestContext';
import { HomeStackParamList } from '../navigation/MainTabs';
import { ServiceRequest, ServiceRequestStatus } from '../types/serviceRequest';
import { STATUS_CONFIG } from '../constants/statusConfig';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import {
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
} from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function MyRequestsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { getClientRequests, refresh, isLoading } = useServiceRequests();
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  // Reload requests when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRequests();
    }, [])
  );

  const loadRequests = () => {
    const clientRequests = getClientRequests();
    // Sort by most recent first
    setRequests(clientRequests.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    loadRequests();
    setRefreshing(false);
  };

  const handleRequestPress = (requestId: string) => {
    navigation.navigate('RequestDetail', { requestId });
  };

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (time: string): string => {
    // Assuming time is in HH:mm format
    return time;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <ClockIcon size={64} color={colors.neutral[300]} />
      </View>
      <Text style={styles.emptyTitle}>No Service Requests</Text>
      <Text style={styles.emptySubtitle}>
        Create your first service request to find providers
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateRequest')}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonText}>Create Request</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRequestCard = (request: ServiceRequest) => {
    return (
      <TouchableOpacity
        key={request.id}
        style={styles.requestCard}
        onPress={() => handleRequestPress(request.id)}
        activeOpacity={0.8}
      >
        {/* Status Badge */}
        <StatusBadge status={request.status} />

        {/* Request Info */}
        <View style={styles.requestHeader}>
          <Text style={styles.requestCategory}>
            {request.serviceCategory.charAt(0).toUpperCase() + request.serviceCategory.slice(1)}
          </Text>
          <Text style={styles.requestDate}>{formatDate(request.createdAt)}</Text>
        </View>

        <Text style={styles.requestDescription} numberOfLines={2}>
          {request.description}
        </Text>

        {/* Location & Time */}
        <View style={styles.requestDetails}>
          <View style={styles.detailRow}>
            <MapPinIcon size={14} color={colors.neutral[500]} />
            <Text style={styles.detailText} numberOfLines={1}>
              {request.location.address}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <CalendarIcon size={14} color={colors.neutral[500]} />
            <Text style={styles.detailText}>
              {request.timeSlot.date} • {formatTime(request.timeSlot.startTime)} - {formatTime(request.timeSlot.endTime)}
            </Text>
          </View>
        </View>

        {/* Provider Info (if assigned) */}
        {request.assignedProviderName && (
          <View style={styles.providerInfo}>
            <Avatar name={request.assignedProviderName} size="sm" role="provider" />
            <Text style={styles.providerName}>{request.assignedProviderName}</Text>
          </View>
        )}

        {/* Rating CTA (if completed and not rated) */}
        {request.status === 'completed' && !request.rating && (
          <View style={styles.ratingCta}>
            <StarIcon size={16} color={colors.accent.gold} />
            <Text style={styles.ratingCtaText}>Rate this service</Text>
          </View>
        )}

        {/* Rating Display (if rated) */}
        {request.rating && (
          <View style={styles.ratingDisplay}>
            <StarIcon size={16} color={colors.accent.gold} filled />
            <Text style={styles.ratingText}>Rated {request.rating}/5</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Requests</Text>
        <Text style={styles.subtitle}>{requests.length} service requests</Text>
      </View>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  requestCategory: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  requestDate: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
  },
  requestDescription: {
    fontSize: typography.size.sm,
    color: colors.neutral[700],
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  requestDetails: {
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
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing.sm,
  },
  providerName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[800],
  },
  ratingCta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing.xs,
  },
  ratingCtaText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.accent.gold,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[700],
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
    marginBottom: spacing.xl,
  },
  createButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  createButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
  },
});
