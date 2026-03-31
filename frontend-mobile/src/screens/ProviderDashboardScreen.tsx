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
import Avatar from '../components/Avatar';
import {
  BriefcaseIcon,
  BellIcon,
  ChevronRightIcon,
  ClockIcon,
} from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const CATEGORY_EMOJI: Record<string, string> = {
  plumbing: '🔧', electrical: '⚡', cleaning: '🧹',
  gardening: '🌿', painting: '🎨', carpentry: '🪚', moving: '📦', other: '⚙️',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function ProviderDashboardScreen() {
  const { user } = useAuth();
  const { getProviderRequests, refresh } = useServiceRequests();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.fullName?.split(' ')[0] || 'User';
  const businessName = user?.businessName;

  const pendingRequests = getProviderRequests()
    .filter((r) => r.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
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
        <View style={styles.headerGlowCircle} />

        <View style={styles.headerTopRow}>
          <View style={styles.headerProviderBadge}>
            <BriefcaseIcon size={12} color="rgba(255,255,255,0.85)" />
            <Text style={styles.headerProviderBadgeText}>PROVIDER</Text>
          </View>
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => Alert.alert('Notifications', 'You have 5 new notifications')}
          >
            <BellIcon size={20} color={colors.neutral[0]} />
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>5</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.tagline}>{getGreeting()} 👋</Text>
        <Text style={styles.greeting}>
          {firstName}
          {businessName ? `,\n${businessName}` : ''}
        </Text>
        <Text style={styles.subGreeting}>Let's grow your business today</Text>
      </LinearGradient>

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

        {/* ── New Requests ─────────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>INCOMING</Text>
            <Text style={styles.sectionTitle}>New Requests</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate('IncomingRequests')}
          >
            <Text style={styles.seeAll}>See all</Text>
            <ChevronRightIcon size={12} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>

        {pendingRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <ClockIcon size={32} color={colors.primary[400]} />
            </View>
            <Text style={styles.emptyTitle}>No new requests yet</Text>
            <Text style={styles.emptySubtitle}>New service requests from clients will appear here</Text>
          </View>
        ) : (
          <View style={styles.requestsList}>
            {pendingRequests.map((req) => (
              <TouchableOpacity
                key={req.id}
                style={styles.requestCard}
                onPress={() => navigation.navigate('IncomingRequests')}
                activeOpacity={0.8}
              >
                <Avatar name={req.clientName} size="md" role="client" />
                <View style={styles.requestCardContent}>
                  <Text style={styles.requestClientName}>{req.clientName}</Text>
                  <Text style={styles.requestService}>
                    {CATEGORY_EMOJI[req.serviceCategory] || '⚙️'}{' '}
                    {req.serviceCategory.charAt(0).toUpperCase() + req.serviceCategory.slice(1)}
                  </Text>
                  {req.budget && (
                    <Text style={styles.requestBudget}>
                      Budget: ${req.budget.min}–${req.budget.max}
                    </Text>
                  )}
                </View>
                <ChevronRightIcon size={16} color={colors.neutral[300]} />
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

  // ── Gradient Header
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  headerGlowCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(38, 96, 175, 0.25)',
    top: -60,
    right: -30,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerProviderBadge: {
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
  headerProviderBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: typography.letterSpacing.wider,
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
    color: 'rgba(255,255,255,0.65)',
    marginBottom: spacing.xs,
    letterSpacing: typography.letterSpacing.wide,
  },
  greeting: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    lineHeight: typography.lineHeight['2xl'],
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.xs,
  },
  subGreeting: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: typography.weight.regular,
  },

  scrollView: {
    flex: 1,
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

  // ── Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.size.sm,
    color: colors.neutral[400],
    textAlign: 'center',
    maxWidth: 220,
    lineHeight: typography.lineHeight.sm,
  },

  // ── Request cards
  requestsList: {
    marginHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    gap: spacing.md,
    ...shadows.card,
  },
  requestCardContent: {
    flex: 1,
    gap: 3,
  },
  requestClientName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
  },
  requestService: {
    fontSize: typography.size.sm,
    color: colors.neutral[600],
    fontWeight: typography.weight.medium,
  },
  requestBudget: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
  },

});
