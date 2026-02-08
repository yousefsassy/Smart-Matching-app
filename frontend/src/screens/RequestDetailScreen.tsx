import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useServiceRequests } from '../context/ServiceRequestContext';
import { HomeStackParamList } from '../navigation/MainTabs';
import { ServiceRequest, ServiceRequestStatus } from '../types/serviceRequest';
import PrimaryButton from '../components/PrimaryButton';
import {
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
} from '../components/Icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'RequestDetail'>;

const STATUS_CONFIG: Record<
  ServiceRequestStatus,
  { color: string; bgColor: string; label: string; icon: React.ReactElement }
> = {
  pending: {
    color: colors.accent.gold,
    bgColor: `${colors.accent.gold}15`,
    label: 'Pending',
    icon: <ClockIcon size={20} color={colors.accent.gold} />,
  },
  accepted: {
    color: colors.accent.cyan,
    bgColor: `${colors.accent.cyan}15`,
    label: 'Accepted',
    icon: <CheckCircleIcon size={20} color={colors.accent.cyan} />,
  },
  in_progress: {
    color: colors.primary[600],
    bgColor: colors.primary[50],
    label: 'In Progress',
    icon: <ClockIcon size={20} color={colors.primary[600]} />,
  },
  completed: {
    color: colors.success,
    bgColor: `${colors.success}15`,
    label: 'Completed',
    icon: <CheckCircleIcon size={20} color={colors.success} />,
  },
  rejected: {
    color: colors.error,
    bgColor: `${colors.error}15`,
    label: 'Rejected',
    icon: <XCircleIcon size={20} color={colors.error} />,
  },
  cancelled: {
    color: colors.neutral[500],
    bgColor: colors.neutral[100],
    label: 'Cancelled',
    icon: <XCircleIcon size={20} color={colors.neutral[500]} />,
  },
};

export default function RequestDetailScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const { getRequestById, cancelRequest } = useServiceRequests();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = () => {
    const req = getRequestById(requestId);
    setRequest(req);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this service request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              await cancelRequest(requestId);
              Alert.alert('Success', 'Request cancelled successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel request');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleRateProvider = () => {
    navigation.navigate('RateProvider', { requestId });
  };

  const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!request) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading request...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[request.status];
  const canCancel = request.status === 'pending';
  const canRate = request.status === 'completed' && !request.rating;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            {statusConfig.icon}
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Request Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Request</Text>

          <View style={styles.requestInfo}>
            <Text style={styles.category}>
              {request.serviceCategory.charAt(0).toUpperCase() +
                request.serviceCategory.slice(1)}
            </Text>
            <Text style={styles.description}>{request.description}</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <MapPinIcon size={20} color={colors.neutral[500]} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{request.location.address}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <CalendarIcon size={20} color={colors.neutral[500]} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {request.timeSlot.date} at {request.timeSlot.startTime} -{' '}
                  {request.timeSlot.endTime}
                </Text>
              </View>
            </View>

            {request.budget && (
              <View style={styles.detailItem}>
                <TagIcon size={20} color={colors.neutral[500]} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Budget</Text>
                  <Text style={styles.detailValue}>
                    ${request.budget.min} - ${request.budget.max}{' '}
                    {request.budget.currency}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Provider Info (if assigned) */}
        {request.assignedProviderName && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Assigned Provider</Text>
            <View style={styles.providerInfo}>
              <View style={styles.providerAvatar}>
                <UserIcon size={24} color={colors.primary[600]} />
              </View>
              <View style={styles.providerDetails}>
                <Text style={styles.providerName}>
                  {request.assignedProviderName}
                </Text>
                {request.acceptedAt && (
                  <Text style={styles.providerMeta}>
                    Accepted on {formatDate(request.acceptedAt)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Rating Display (if rated) */}
        {request.rating && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Rating</Text>
            <View style={styles.ratingDisplay}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    size={28}
                    color={colors.accent.gold}
                    filled={star <= request.rating!}
                  />
                ))}
              </View>
              <Text style={styles.ratingValue}>{request.rating} / 5</Text>
              {request.review && (
                <View style={styles.reviewBox}>
                  <Text style={styles.reviewText}>{request.review}</Text>
                </View>
              )}
              {request.reviewedAt && (
                <Text style={styles.reviewDate}>
                  Reviewed on {formatDate(request.reviewedAt)}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status Timeline</Text>
          <View style={styles.timeline}>
            {request.statusHistory.map((entry, index) => {
              const isLast = index === request.statusHistory.length - 1;
              const entryConfig = STATUS_CONFIG[entry.status];

              return (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineIconContainer}>
                    <View
                      style={[
                        styles.timelineIcon,
                        { backgroundColor: entryConfig.bgColor },
                      ]}
                    >
                      {entryConfig.icon}
                    </View>
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineStatus}>{entryConfig.label}</Text>
                    <Text style={styles.timelineDate}>
                      {formatDate(entry.timestamp)} at {formatTime(entry.timestamp)}
                    </Text>
                    {entry.note && (
                      <Text style={styles.timelineNote}>{entry.note}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {canRate && (
            <PrimaryButton
              title="Rate Provider"
              onPress={handleRateProvider}
              icon={<StarIcon size={20} color={colors.neutral[0]} />}
            />
          )}

          {canCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <>
                  <XCircleIcon size={20} color={colors.error} />
                  <Text style={styles.cancelButtonText}>Cancel Request</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.size.base,
    color: colors.neutral[600],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  backButton: {
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.primary[600],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  requestInfo: {
    marginBottom: spacing.md,
  },
  category: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.size.base,
    color: colors.neutral[700],
    lineHeight: 22,
  },
  detailsGrid: {
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.neutral[500],
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: typography.size.sm,
    color: colors.neutral[800],
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  providerMeta: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
  },
  ratingDisplay: {
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  ratingValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.accent.gold,
    marginBottom: spacing.md,
  },
  reviewBox: {
    width: '100%',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  reviewText: {
    fontSize: typography.size.sm,
    color: colors.neutral[700],
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
  },
  timeline: {
    paddingTop: spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineIconContainer: {
    alignItems: 'center',
  },
  timelineIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.xs,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  timelineStatus: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    marginBottom: spacing.xs,
  },
  timelineNote: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
    fontStyle: 'italic',
  },
  actionsContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
    paddingVertical: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.error,
    gap: spacing.sm,
  },
  cancelButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.error,
  },
});
