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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { getServiceCategoryLabel, getServiceCategoryMeta } from '../constants/serviceCategories';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useServiceRequests } from '../context/ServiceRequestContext';
import { HomeStackParamList } from '../navigation/MainTabs';
import { ServiceRequest } from '../types/serviceRequest';
import { STATUS_CONFIG } from '../constants/statusConfig';
import { formatBudgetRange } from '../utils/formatters';
import PrimaryButton from '../components/PrimaryButton';
import StatusBadge from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import {
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  XCircleIcon,
  StarIcon,
  ChevronLeftIcon,
} from '../components/Icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'RequestDetail'>;

export default function RequestDetailScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const { getRequestById, cancelRequest } = useServiceRequests();
  const insets = useSafeAreaInsets();
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
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading request...</Text>
      </View>
    );
  }

  const canCancel = request.status === 'pending';
  const canRate = request.status === 'completed' && !request.rating;
  const hasAction = canCancel || canRate;

  const categoryMeta = getServiceCategoryMeta(request.serviceCategory);
  const categoryEmoji = categoryMeta.emoji;
  const categoryLabel = getServiceCategoryLabel(request.serviceCategory);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: hasAction ? insets.bottom + 96 : insets.bottom + spacing['2xl'],
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Category Hero Header ─────────────────────────────────────────────── */}
        <LinearGradient
          colors={colors.gradients.header as [string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}
        >
          {/* Decorative circle */}
          <View style={styles.heroDecorCircle} />

          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeftIcon size={20} color={colors.neutral[0]} />
          </TouchableOpacity>

          {/* Category emoji + title */}
          <View style={styles.heroContent}>
            <Text style={styles.heroEmoji}>{categoryEmoji}</Text>
            <View style={styles.heroText}>
              <Text style={styles.heroEyebrow}>SERVICE REQUEST</Text>
              <Text style={styles.heroTitle}>{categoryLabel}</Text>
              <StatusBadge status={request.status} />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>

          {/* ── Description ──────────────────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>DESCRIPTION</Text>
            <Text style={styles.description}>{request.description}</Text>
          </View>

          {/* ── Detail pills ─────────────────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>DETAILS</Text>
            <View style={styles.pillsGrid}>
              <View style={styles.detailPill}>
                <View style={styles.detailPillIcon}>
                  <MapPinIcon size={14} color={colors.primary[600]} />
                </View>
                <View style={styles.detailPillBody}>
                  <Text style={styles.detailPillLabel}>Location</Text>
                  <Text style={styles.detailPillValue} numberOfLines={2}>
                    {request.requestLocation.addressLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.detailPill}>
                <View style={styles.detailPillIcon}>
                  <CalendarIcon size={14} color={colors.accent.cyan} />
                </View>
                <View style={styles.detailPillBody}>
                  <Text style={styles.detailPillLabel}>Scheduled</Text>
                  <Text style={styles.detailPillValue}>
                    {request.timeSlot.date}
                    {'\n'}{request.timeSlot.startTime} – {request.timeSlot.endTime}
                  </Text>
                </View>
              </View>

              {request.budget && (
                <View style={styles.detailPill}>
                  <View style={[styles.detailPillIcon, { backgroundColor: colors.accent.goldLight }]}>
                    <TagIcon size={14} color={colors.accent.gold} />
                  </View>
                  <View style={styles.detailPillBody}>
                    <Text style={styles.detailPillLabel}>Budget</Text>
                    <Text style={styles.detailPillValue}>
                      {formatBudgetRange(request.budget)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* ── Assigned Provider ────────────────────────────────────────────────── */}
          {request.assignedProviderName && (
            <LinearGradient
              colors={[colors.primary[700], colors.primary[900]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.providerCard}
            >
              <View style={styles.providerDecorCircle} />
              <Text style={styles.providerCardEyebrow}>ASSIGNED PROVIDER</Text>
              <View style={styles.providerRow}>
                <Avatar name={request.assignedProviderName} size="lg" role="provider" />
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{request.assignedProviderName}</Text>
                  {request.acceptedAt && (
                    <Text style={styles.providerMeta}>
                      Accepted on {formatDate(request.acceptedAt)}
                    </Text>
                  )}
                </View>
              </View>
            </LinearGradient>
          )}

          {/* ── Rating Display ───────────────────────────────────────────────────── */}
          {request.rating && (
            <View style={styles.card}>
              <Text style={styles.cardEyebrow}>YOUR RATING</Text>
              <View style={styles.ratingBlock}>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      size={30}
                      color={colors.accent.gold}
                      filled={star <= request.rating!}
                    />
                  ))}
                </View>
                <Text style={styles.ratingValue}>{request.rating} / 5</Text>
                {request.review && (
                  <View style={styles.reviewBox}>
                    <Text style={styles.reviewText}>"{request.review}"</Text>
                  </View>
                )}
                {request.reviewedAt && (
                  <Text style={styles.reviewDate}>Reviewed on {formatDate(request.reviewedAt)}</Text>
                )}
              </View>
            </View>
          )}

          {/* ── Timeline ─────────────────────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>STATUS TIMELINE</Text>
            <View style={styles.timeline}>
              {request.statusHistory.map((entry, index) => {
                const isLast = index === request.statusHistory.length - 1;
                const entryConfig = STATUS_CONFIG[entry.status];

                return (
                  <View key={index} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineDot, { backgroundColor: entryConfig.bgColor }]}>
                        {entryConfig.icon(14)}
                      </View>
                      {!isLast && <View style={[styles.timelineLine, { backgroundColor: entryConfig.bgColor + '40' }]} />}
                    </View>
                    <View style={styles.timelineBody}>
                      <Text style={styles.timelineStatus}>{entryConfig.label}</Text>
                      <Text style={styles.timelineDate}>
                        {formatDate(entry.timestamp)} · {formatTime(entry.timestamp)}
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
        </View>
      </ScrollView>

      {/* ── Sticky Action Bar ────────────────────────────────────────────────────── */}
      {hasAction && (
        <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          {canRate && (
            <PrimaryButton
              title="Rate Provider"
              onPress={handleRateProvider}
              icon={<StarIcon size={18} color={colors.neutral[900]} />}
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
                  <XCircleIcon size={18} color={colors.error} />
                  <Text style={styles.cancelButtonText}>Cancel Request</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    fontSize: typography.size.base,
    color: colors.neutral[500],
    marginTop: spacing.md,
  },

  // ── Hero
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 180,
  },
  heroDecorCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -50,
    right: -40,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.overlay.glassStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.base,
  },
  heroEmoji: {
    fontSize: 52,
    lineHeight: 62,
  },
  heroText: {
    flex: 1,
    gap: spacing.sm,
  },
  heroEyebrow: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: typography.letterSpacing.widest,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    letterSpacing: typography.letterSpacing.tight,
  },

  // ── Content area
  content: {
    padding: spacing.xl,
    gap: spacing.base,
  },

  // ── Generic card
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    ...shadows.card,
    gap: spacing.md,
  },
  cardEyebrow: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.primary[500],
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: typography.size.base,
    color: colors.neutral[700],
    lineHeight: typography.lineHeight.base,
  },

  // ── Detail pills grid
  pillsGrid: {
    gap: spacing.sm,
  },
  detailPill: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  detailPillIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  detailPillBody: {
    flex: 1,
  },
  detailPillLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.neutral[400],
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  detailPillValue: {
    fontSize: typography.size.sm,
    color: colors.neutral[800],
    fontWeight: typography.weight.medium,
    lineHeight: typography.lineHeight.sm,
  },

  // ── Provider card (gradient)
  providerCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    overflow: 'hidden',
    position: 'relative',
    gap: spacing.md,
    ...shadows.lg,
  },
  providerDecorCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
    right: -30,
    bottom: -40,
  },
  providerCardEyebrow: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase',
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    marginBottom: 3,
  },
  providerMeta: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.65)',
  },

  // ── Rating display
  ratingBlock: {
    alignItems: 'center',
    gap: spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.accent.gold,
  },
  reviewBox: {
    width: '100%',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.gold,
  },
  reviewText: {
    fontSize: typography.size.sm,
    color: colors.neutral[700],
    lineHeight: typography.lineHeight.base,
    fontStyle: 'italic',
  },
  reviewDate: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
  },

  // ── Timeline
  timeline: {
  },
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 36,
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  timelineBody: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  timelineStatus: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[800],
    marginBottom: 3,
  },
  timelineDate: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    marginBottom: spacing.xs,
  },
  timelineNote: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
    fontStyle: 'italic',
  },

  // ── Sticky action bar
  actionBar: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    ...shadows.tabBar,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorLight,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
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
