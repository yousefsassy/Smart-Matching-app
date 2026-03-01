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
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useServiceRequests } from '../context/ServiceRequestContext';
import { HomeStackParamList } from '../navigation/MainTabs';
import StatusBadge from '../components/StatusBadge';
import { ServiceRequest } from '../types/serviceRequest';
import {
  SparkleIcon,
  BellIcon,
  ChevronRightIcon,
  MapPinIcon,
  SearchIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
} from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

// ── Helpers ────────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Static data ────────────────────────────────────────────────────────────────

const MOCK_LOCATION = 'Tunis, Tunisia';

const SERVICE_CATEGORIES = [
  {
    label: 'Plumbing',
    emoji: '🔧',
    colors: [colors.primary[500], colors.primary[700]] as [string, string],
  },
  {
    label: 'Electrical',
    emoji: '⚡',
    colors: [colors.accent.mustard, '#F59500'] as [string, string],
  },
  {
    label: 'Cleaning',
    emoji: '🧹',
    colors: [colors.accent.cyan, colors.primary[600]] as [string, string],
  },
  {
    label: 'Gardening',
    emoji: '🌿',
    colors: ['#22C55E', '#16A34A'] as [string, string],
  },
  {
    label: 'Painting',
    emoji: '🎨',
    colors: [colors.accent.coral, '#C0331F'] as [string, string],
  },
  {
    label: 'Carpentry',
    emoji: '🪚',
    colors: ['#A16207', '#78420A'] as [string, string],
  },
  {
    label: 'Moving',
    emoji: '📦',
    colors: [colors.primary[400], colors.primary[700]] as [string, string],
  },
  {
    label: 'More',
    emoji: '⚙️',
    colors: [colors.neutral[500], colors.neutral[700]] as [string, string],
  },
];

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function ClientDashboardScreen() {
  const { user } = useAuth();
  const { getClientRequests } = useServiceRequests();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const requests = getClientRequests();
  const activeCount = requests.filter(
    (r) => r.status === 'pending' || r.status === 'accepted' || r.status === 'in_progress'
  ).length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;
  const firstName = user?.fullName?.split(' ')[0] || 'there';

  // Show up to 3 most recent requests in the dashboard
  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  return (
    <View style={styles.root}>

      {/* ── Flat warm header — same bg as page, fully seamless ─────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        {/* Row 1: Location + Bell */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.locationPill} activeOpacity={0.75}>
            <MapPinIcon size={13} color={colors.primary[600]} />
            <Text style={styles.locationText}>{MOCK_LOCATION}</Text>
            <ChevronRightIcon size={12} color={colors.primary[600]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => Alert.alert('Notifications', 'You have 3 new notifications')}
          >
            <BellIcon size={20} color={colors.primary[600]} />
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Row 2: Greeting */}
        <Text style={styles.greeting}>
          {getGreeting()}, {firstName} 👋
        </Text>
        <Text style={styles.tagline}>What service do you need?</Text>
      </View>

      {/* ── Scrollable body ────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing['4xl'] }}
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
<<<<<<< HEAD
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, Faten </Text>
            <Text style={styles.tagline}>Let's find your perfect match today</Text>
=======

        {/* ── Search bar ────────────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateRequest')}
          activeOpacity={0.8}
          style={styles.searchBar}
        >
          <SearchIcon size={18} color={colors.neutral[400]} />
          <Text style={styles.searchPlaceholder}>Search for a service...</Text>
          <View style={styles.searchPostButton}>
            <Text style={styles.searchPostButtonText}>Post</Text>
>>>>>>> c718a8721c73424300a2ae46c4864a5f70cc9bfa
          </View>
        </TouchableOpacity>

        {/* ── Stats strip ───────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          {/* Active */}
          <View style={styles.statChip}>
            <View style={[styles.statChipIcon, { backgroundColor: colors.primary[50] }]}>
              <ClockIcon size={15} color={colors.primary[600]} />
            </View>
            <View>
              <Text style={styles.statChipValue}>{activeCount}</Text>
              <Text style={styles.statChipLabel}>Active</Text>
            </View>
          </View>

          {/* Completed */}
          <View style={styles.statChip}>
            <View style={[styles.statChipIcon, { backgroundColor: colors.successLight }]}>
              <CheckCircleIcon size={15} color={colors.success} />
            </View>
            <View>
              <Text style={styles.statChipValue}>{completedCount}</Text>
              <Text style={styles.statChipLabel}>Done</Text>
            </View>
          </View>

          {/* AI Matches */}
          <View style={styles.statChip}>
            <View style={[styles.statChipIcon, { backgroundColor: colors.accent.mustardLight }]}>
              <SparkleIcon size={15} color={colors.accent.mustard} />
            </View>
            <View>
              <Text style={styles.statChipValue}>12</Text>
              <Text style={styles.statChipLabel}>Matches</Text>
            </View>
          </View>
        </ScrollView>

        {/* ── Mustard CTA ───────────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateRequest')}
          activeOpacity={0.9}
          style={styles.ctaWrapper}
        >
          <LinearGradient
            colors={colors.gradients.mustard as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <SparkleIcon size={20} color={colors.neutral[900]} />
            <Text style={styles.ctaText}>Post a Service Request</Text>
            <ChevronRightIcon size={18} color={colors.neutral[900]} />
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Service Categories ────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Service Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreateRequest')}>
            <Text style={styles.seeAll}>View all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {SERVICE_CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => navigation.navigate('CreateRequest')}
              activeOpacity={0.85}
              style={styles.categoryItem}
            >
              <LinearGradient colors={item.colors} style={styles.categoryTile}>
                <Text style={styles.categoryEmoji}>{item.emoji}</Text>
              </LinearGradient>
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Promo banner (CG Red) ─────────────────────────────────────────── */}
        <View style={styles.promoBannerWrapper}>
          <LinearGradient
            colors={['#ED3F27', '#C0331F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoBanner}
          >
            <View style={styles.promoContent}>
              <Text style={styles.promoEyebrow}>#PromoToday</Text>
              <Text style={styles.promoTitle}>Work with our best{'\n'}service providers</Text>
            </View>
            <TouchableOpacity
              style={styles.promoButton}
              onPress={() => navigation.navigate('CreateRequest')}
              activeOpacity={0.85}
            >
              <Text style={styles.promoButtonText}>Book Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* ── My Requests ───────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Requests</Text>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate('RequestsTab')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {recentRequests.length === 0 ? (
          /* Empty state */
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🗂️</Text>
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptySubtitle}>
              Post your first service request to get matched with top providers near you.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateRequest')}
              activeOpacity={0.85}
            >
<<<<<<< HEAD
              <SearchIcon size={24} color={colors.neutral[0]} />
            </LinearGradient>
            <Text style={styles.actionText}>Find Providers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.getParent()?.navigate('MatchesTab')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.accent.cyan, colors.primary[500]]}
              style={styles.actionGradient}
            >
              <MatchIcon size={24} color={colors.neutral[0]} />
            </LinearGradient>
            <Text style={styles.actionText}>My Matches</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.getParent()?.navigate('MessagesTab')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.accent.purple, colors.primary[600]]}
              style={styles.actionGradient}
            >
              <MessageIcon size={24} color={colors.neutral[0]} />
            </LinearGradient>
            <Text style={styles.actionText}>Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Saved', 'View saved providers')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.accent.coral, colors.accent.gold]}
              style={styles.actionGradient}
            >
              <HeartIcon size={24} color={colors.neutral[0]} />
            </LinearGradient>
            <Text style={styles.actionText}>Saved</Text>
          </TouchableOpacity>
        </View>

        {/* Top AI Matches */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top AI Matches</Text>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate('MatchesTab')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.matchesList}>
          <Card
            title="Firas Saidi"
            subtitle="Business Consultant • 98% match • 4.9★"
            icon={<Avatar name="Firas Saidi" size="md" role="provider" />}
            badge="NEW"
            onPress={() => handleViewMatch('Firas Saidi')}
            style={styles.matchCard}
          />
          <Card
            title="Aziz Benzarti"
            subtitle="Marketing Expert • 95% match • 4.8★"
            icon={<Avatar name="Aziz Benzarti" size="md" role="provider" />}
            onPress={() => handleViewMatch('Aziz Benzarti')}
            style={styles.matchCard}
          />
          <Card
            title="Youssef Sassi"
            subtitle="Web Developer • 92% match • 5.0★"
            icon={<Avatar name="Youssef Sassi" size="md" role="provider" />}
            badge="HOT"
            onPress={() => handleViewMatch('Youssef Sassi')}
            style={styles.matchCard}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <MessageIcon size={16} color={colors.primary[600]} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New message from Firas Saidi</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
=======
              <Text style={styles.emptyButtonText}>Post a Request</Text>
            </TouchableOpacity>
>>>>>>> c718a8721c73424300a2ae46c4864a5f70cc9bfa
          </View>
        ) : (
          /* Request cards */
          <View style={styles.requestsList}>
            {recentRequests.map((request: ServiceRequest) => (
              <TouchableOpacity
                key={request.id}
                style={styles.requestCard}
                onPress={() => navigation.navigate('RequestDetail', { requestId: request.id })}
                activeOpacity={0.8}
              >
                <View style={styles.requestCardTop}>
                  <Text style={styles.requestCardCategory}>
                    {request.serviceCategory.charAt(0).toUpperCase() +
                      request.serviceCategory.slice(1)}
                  </Text>
                  <StatusBadge status={request.status} />
                </View>
                <Text style={styles.requestCardDesc} numberOfLines={2}>
                  {request.description}
                </Text>
                <View style={styles.requestCardMeta}>
                  <MapPinIcon size={12} color={colors.neutral[500]} />
                  <Text style={styles.requestCardMetaText} numberOfLines={1}>
                    {request.location.address}
                  </Text>
                  <Text style={styles.requestCardDot}>·</Text>
                  <CalendarIcon size={12} color={colors.neutral[500]} />
                  <Text style={styles.requestCardDate}>
                    {formatDate(request.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
<<<<<<< HEAD
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <HeartIcon size={16} color={colors.accent.coral} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Aziz Roberts saved your request</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: spacing['4xl'] }} />
=======
        )}
>>>>>>> c718a8721c73424300a2ae46c4864a5f70cc9bfa
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },

  // ── Header (flat, warm — same bg as page)
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.base,
    backgroundColor: colors.neutral[50],
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  locationText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary[600],
  },
  bellButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.accent.coral,
    borderRadius: borderRadius.full,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    fontSize: 9,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    lineHeight: 11,
  },
  greeting: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },

  // ── Scroll wrapper
  scrollView: {
    flex: 1,
  },

  // ── Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.neutral[400],
  },
  searchPostButton: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  searchPostButtonText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },

  // ── Stats strip
  statsRow: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  statChipIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statChipValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    lineHeight: typography.lineHeight.lg,
  },
  statChipLabel: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
  },

  // ── Mustard CTA
  ctaWrapper: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  ctaGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  ctaText: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900], // Dark text on mustard for WCAG contrast
  },

  // ── Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
  },
  seeAll: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary[600],
  },

  // ── Service Categories
  categoriesRow: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  categoryItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryTile: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: typography.size.xs,
    color: colors.neutral[700],
    fontWeight: typography.weight.medium,
    textAlign: 'center',
  },

  // ── Promo banner
  promoBannerWrapper: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    gap: spacing.md,
    minHeight: 90,
  },
  promoContent: {
    flex: 1,
  },
  promoEyebrow: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  promoTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    lineHeight: typography.lineHeight.base,
  },
  promoButton: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  promoButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },

  // ── My Requests section
  requestsList: {
    marginHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  requestCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    ...shadows.sm,
  },
  requestCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  requestCardCategory: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    flex: 1,
    marginRight: spacing.sm,
  },
  requestCardDesc: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
    lineHeight: typography.lineHeight.sm,
    marginBottom: spacing.sm,
  },
  requestCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  requestCardMetaText: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    flex: 1,
  },
  requestCardDate: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
  },
  requestCardDot: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
  },

  // ── Empty state
  emptyState: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: typography.lineHeight.base,
    marginBottom: spacing.xl,
  },
  emptyButton: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  emptyButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
});
