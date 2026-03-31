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
  BellIcon,
  ChevronRightIcon,
  MapPinIcon,
  SearchIcon,
  CalendarIcon,
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
    gradientColors: [colors.primary[500], colors.primary[700]] as [string, string],
  },
  {
    label: 'Electrical',
    emoji: '⚡',
    gradientColors: [colors.accent.mustard, '#F59500'] as [string, string],
  },
  {
    label: 'Cleaning',
    emoji: '🧹',
    gradientColors: [colors.accent.cyan, colors.primary[600]] as [string, string],
  },
  {
    label: 'Gardening',
    emoji: '🌿',
    gradientColors: ['#22C55E', '#16A34A'] as [string, string],
  },
  {
    label: 'Painting',
    emoji: '🎨',
    gradientColors: [colors.accent.coral, '#C0331F'] as [string, string],
  },
  {
    label: 'Carpentry',
    emoji: '🪚',
    gradientColors: ['#A16207', '#78420A'] as [string, string],
  },
  {
    label: 'Moving',
    emoji: '📦',
    gradientColors: [colors.primary[400], colors.primary[700]] as [string, string],
  },
  {
    label: 'More',
    emoji: '⚙️',
    gradientColors: [colors.neutral[500], colors.neutral[700]] as [string, string],
  },
];

// Status → left border color map
const STATUS_BORDER: Record<string, string> = {
  pending:     colors.accent.gold,
  accepted:    colors.accent.cyan,
  in_progress: colors.primary[500],
  completed:   colors.success,
  rejected:    colors.error,
  cancelled:   colors.neutral[400],
};

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function ClientDashboardScreen() {
  const { user } = useAuth();
  const { getClientRequests } = useServiceRequests();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const requests = getClientRequests();
  const firstName = user?.fullName?.split(' ')[0] || 'there';

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

      {/* ── Gradient Hero Header ──────────────────────────────────────────────── */}
      <LinearGradient
        colors={['#0A2744', '#134686', '#1a5699']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.base }]}
      >
        {/* Decorative glow circle */}
        <View style={styles.headerGlowCircle} />

        {/* Row 1: Location + Bell */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.locationPill} activeOpacity={0.75}>
            <MapPinIcon size={13} color="rgba(255,255,255,0.9)" />
            <Text style={styles.locationText}>{MOCK_LOCATION}</Text>
            <ChevronRightIcon size={12} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => Alert.alert('Notifications', 'You have 3 new notifications')}
          >
            <BellIcon size={20} color={colors.neutral[0]} />
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Row 2: Greeting */}
        <Text style={styles.tagline}>{getGreeting()} 👋</Text>
        <Text style={styles.greeting}>{firstName}, what do you need today?</Text>
      </LinearGradient>

      {/* ── Scrollable body ────────────────────────────────────────────────────── */}
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

        {/* ── Search bar (floating over header→body transition) ───────────────── */}
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateRequest')}
          activeOpacity={0.8}
          style={styles.searchBar}
        >
          <View style={styles.searchIconWrap}>
            <SearchIcon size={17} color={colors.primary[500]} />
          </View>
          <Text style={styles.searchPlaceholder}>Search for a service...</Text>
          <LinearGradient
            colors={colors.gradients.mustard as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.searchPostButton}
          >
            <Text style={styles.searchPostButtonText}>Post</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Mustard CTA ─────────────────────────────────────────────────────── */}
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
            <Text style={styles.ctaText}>Post a Service Request</Text>
            <View style={styles.ctaArrow}>
              <ChevronRightIcon size={16} color={colors.neutral[900]} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Service Categories ───────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>BROWSE</Text>
            <Text style={styles.sectionTitle}>Service Categories</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate('CreateRequest')}
          >
            <Text style={styles.seeAll}>View all</Text>
            <ChevronRightIcon size={12} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesGrid}>
          {SERVICE_CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => navigation.navigate('CreateRequest')}
              activeOpacity={0.82}
              style={styles.categoryCard}
            >
              <LinearGradient
                colors={item.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.categoryIconWrap}
              >
                <Text style={styles.categoryEmoji}>{item.emoji}</Text>
              </LinearGradient>
              <Text style={styles.categoryLabel} numberOfLines={1}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── My Requests ─────────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>RECENT</Text>
            <Text style={styles.sectionTitle}>My Requests</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.getParent()?.navigate('RequestsTab')}
          >
            <Text style={styles.seeAll}>See all</Text>
            <ChevronRightIcon size={12} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>

        {recentRequests.length === 0 ? (
          /* Empty state */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyEmoji}>🗂️</Text>
            </View>
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptySubtitle}>
              Post your first service request to get matched with top providers near you.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateRequest')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={colors.gradients.primary as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>Post a Request</Text>
              </LinearGradient>
            </TouchableOpacity>
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
                {/* Status left border */}
                <View
                  style={[
                    styles.requestCardAccent,
                    { backgroundColor: STATUS_BORDER[request.status] || colors.neutral[300] },
                  ]}
                />
                <View style={styles.requestCardBody}>
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
                    <MapPinIcon size={11} color={colors.neutral[400]} />
                    <Text style={styles.requestCardMetaText} numberOfLines={1}>
                      {request.location.address}
                    </Text>
                    <View style={styles.requestCardDot} />
                    <CalendarIcon size={11} color={colors.neutral[400]} />
                    <Text style={styles.requestCardDate}>
                      {formatDate(request.createdAt)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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

  // ── Gradient Hero Header
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
    overflow: 'visible',
    position: 'relative',
  },
  headerGlowCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(38, 96, 175, 0.25)',
    top: -60,
    right: -40,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  locationText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: 'rgba(255,255,255,0.92)',
  },
  bellButton: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.accent.coral,
    borderRadius: borderRadius.full,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.primary[700],
  },
  bellBadgeText: {
    fontSize: 8,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    lineHeight: 10,
  },
  tagline: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
    letterSpacing: typography.letterSpacing.wide,
  },
  greeting: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    lineHeight: typography.lineHeight['2xl'],
    letterSpacing: typography.letterSpacing.tight,
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
    marginTop: -spacing.xl,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.lg,
  },
  searchIconWrap: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.neutral[400],
  },
  searchPostButton: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchPostButtonText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },

  // ── Mustard CTA
  ctaWrapper: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.mustard,
  },
  ctaGradient: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  ctaText: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    letterSpacing: typography.letterSpacing.tight,
  },
  ctaArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.base,
  },
  sectionEyebrow: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.primary[500],
    letterSpacing: typography.letterSpacing.widest,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    letterSpacing: typography.letterSpacing.tight,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAll: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary[600],
  },

  // ── Service Categories (2-column grid)
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  categoryCard: {
    width: '22%',
    alignItems: 'center',
    gap: spacing.sm,
    flexGrow: 1,
  },
  categoryIconWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
    minHeight: 64,
    minWidth: 64,
  },
  categoryEmoji: {
    fontSize: 26,
  },
  categoryLabel: {
    fontSize: typography.size.xs,
    color: colors.neutral[700],
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
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
    flexDirection: 'row',
    overflow: 'hidden',
    ...shadows.card,
  },
  requestCardAccent: {
    width: 4,
  },
  requestCardBody: {
    flex: 1,
    padding: spacing.base,
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
    letterSpacing: typography.letterSpacing.tight,
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
    color: colors.neutral[400],
    flex: 1,
  },
  requestCardDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.neutral[300],
  },
  requestCardDate: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
  },

  // ── Empty state
  emptyState: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius['2xl'],
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    ...shadows.card,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.sm,
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.tight,
  },
  emptySubtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: typography.lineHeight.base,
    marginBottom: spacing.xl,
  },
  emptyButton: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  emptyButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
});
