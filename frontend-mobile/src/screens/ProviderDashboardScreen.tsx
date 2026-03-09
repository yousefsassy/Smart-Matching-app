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
import { HomeStackParamList } from '../navigation/MainTabs';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import {
  BriefcaseIcon,
  TrendingUpIcon,
  MessageIcon,
  CalendarIcon,
  HeartIcon,
  SparkleIcon,
  BellIcon,
  ClockIcon,
  ChevronRightIcon,
  MapPinIcon,
} from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const ACTIVITY_DATA = [
  {
    id: '1',
    icon: 'message',
    title: 'New message from Alex Johnson',
    time: '1 hour ago',
    dotColor: colors.primary[500],
  },
  {
    id: '2',
    icon: 'calendar',
    title: 'Emma Davis booked a consultation',
    time: '3 hours ago',
    dotColor: colors.accent.cyan,
  },
  {
    id: '3',
    icon: 'heart',
    title: 'You received a 5-star review',
    time: '1 day ago',
    dotColor: colors.accent.coral,
  },
];

const NEW_REQUESTS = [
  {
    id: '1',
    name: 'Alex Johnson',
    service: 'Marketing Consultation',
    budget: '$500–1,000',
    isNew: true,
    isHot: false,
  },
  {
    id: '2',
    name: 'Emma Davis',
    service: 'Web Development',
    budget: '$2,000–3,000',
    isNew: false,
    isHot: true,
  },
  {
    id: '3',
    name: 'David Miller',
    service: 'Business Strategy',
    budget: '$800–1,200',
    isNew: false,
    isHot: false,
  },
];

export default function ProviderDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.fullName?.split(' ')[0] || 'User';
  const businessName = user?.businessName;

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

        {/* ── Earnings Card (Full-width gradient) ─────────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.earningsWrapper}
          onPress={() => Alert.alert('Analytics', 'View detailed analytics')}
        >
          <LinearGradient
            colors={[colors.primary[700], colors.primary[900]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.earningsCard}
          >
            <View style={styles.earningsDecoCircle} />
            <View style={styles.earningsLeft}>
              <Text style={styles.earningsEyebrow}>THIS MONTH</Text>
              <Text style={styles.earningsValue}>$12,400</Text>
              <View style={styles.earningsTrend}>
                <TrendingUpIcon size={14} color={colors.success} />
                <Text style={styles.earningsTrendText}>+23% vs last month</Text>
              </View>
            </View>
            <View style={styles.earningsRight}>
              <View style={styles.earningsIconCircle}>
                <TrendingUpIcon size={28} color={colors.neutral[0]} />
              </View>
              <Text style={styles.earningsRightLabel}>Revenue</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Stats Row ───────────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          <View style={styles.statCard}>
            <View style={[styles.statCardBorder, { backgroundColor: colors.primary[500] }]} />
            <View style={[styles.statIconWrap, { backgroundColor: colors.primary[50] }]}>
              <BriefcaseIcon size={16} color={colors.primary[600]} />
            </View>
            <View>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statCardBorder, { backgroundColor: colors.accent.gold }]} />
            <View style={[styles.statIconWrap, { backgroundColor: colors.accent.goldLight }]}>
              <ClockIcon size={16} color={colors.accent.gold} />
            </View>
            <View>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>Requests</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statCardBorder, { backgroundColor: colors.accent.purple }]} />
            <View style={[styles.statIconWrap, { backgroundColor: colors.accent.purpleLight }]}>
              <MessageIcon size={16} color={colors.accent.purple} />
            </View>
            <View>
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statCardBorder, { backgroundColor: colors.accent.cyan }]} />
            <View style={[styles.statIconWrap, { backgroundColor: colors.accent.cyanLight }]}>
              <SparkleIcon size={16} color={colors.accent.cyan} />
            </View>
            <View>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </ScrollView>

        {/* ── AI Boost Banner ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          onPress={() => Alert.alert('AI Boost', 'Upgrade your profile visibility with AI')}
          activeOpacity={0.88}
          style={styles.boostWrapper}
        >
          <LinearGradient
            colors={[colors.accent.mustard, '#F59500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.boostCard}
          >
            <View style={styles.boostIconCircle}>
              <SparkleIcon size={20} color={colors.neutral[900]} />
            </View>
            <View style={styles.boostContent}>
              <Text style={styles.boostTitle}>Boost Your Visibility</Text>
              <Text style={styles.boostSubtitle}>Let AI showcase your profile to more clients</Text>
            </View>
            <View style={styles.boostArrow}>
              <ChevronRightIcon size={16} color={colors.neutral[900]} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Quick Actions ───────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>SHORTCUTS</Text>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('MyServices')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary[500], colors.primary[700]]}
              style={styles.actionIconWrap}
            >
              <BriefcaseIcon size={22} color={colors.neutral[0]} />
            </LinearGradient>
            <Text style={styles.actionLabel}>Services</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert('Calendar', 'View your schedule')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.accent.cyan, '#0D7E7A']}
              style={styles.actionIconWrap}
            >
              <CalendarIcon size={22} color={colors.neutral[0]} />
            </LinearGradient>
            <Text style={styles.actionLabel}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert('Messages', 'View all conversations')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.accent.purple, colors.primary[600]]}
              style={styles.actionIconWrap}
            >
              <MessageIcon size={22} color={colors.neutral[0]} />
            </LinearGradient>
            <Text style={styles.actionLabel}>Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Alert.alert('Reviews', 'Manage your reviews')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.accent.gold, colors.accent.coral]}
              style={styles.actionIconWrap}
            >
              <HeartIcon size={22} color={colors.neutral[0]} />
            </LinearGradient>
            <Text style={styles.actionLabel}>Reviews</Text>
          </TouchableOpacity>
        </View>

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

        <View style={styles.requestsList}>
          {NEW_REQUESTS.map((req) => (
            <TouchableOpacity
              key={req.id}
              style={styles.requestCard}
              onPress={() => navigation.navigate('IncomingRequests')}
              activeOpacity={0.8}
            >
              <Avatar name={req.name} size="md" role="client" />
              <View style={styles.requestCardContent}>
                <View style={styles.requestCardTop}>
                  <Text style={styles.requestClientName}>{req.name}</Text>
                  <View style={styles.requestBadges}>
                    {req.isNew && (
                      <View style={[styles.requestBadge, { backgroundColor: colors.primary[50] }]}>
                        <Text style={[styles.requestBadgeText, { color: colors.primary[600] }]}>NEW</Text>
                      </View>
                    )}
                    {req.isHot && (
                      <View style={[styles.requestBadge, { backgroundColor: colors.accent.coralLight }]}>
                        <Text style={[styles.requestBadgeText, { color: colors.accent.coral }]}>🔥 HOT</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.requestService}>{req.service}</Text>
                <Text style={styles.requestBudget}>Budget: {req.budget}</Text>
              </View>
              <ChevronRightIcon size={16} color={colors.neutral[300]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Recent Activity ──────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>TIMELINE</Text>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
        </View>

        <View style={styles.activityList}>
          {ACTIVITY_DATA.map((item, index) => (
            <View key={item.id} style={styles.activityItem}>
              <View style={styles.activityTimelineCol}>
                <View style={[styles.activityDot, { backgroundColor: item.dotColor }]} />
                {index < ACTIVITY_DATA.length - 1 && <View style={styles.activityLine} />}
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>
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

  // ── Earnings card
  earningsWrapper: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.lg,
  },
  earningsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 110,
  },
  earningsDecoCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
    right: -40,
    bottom: -60,
  },
  earningsLeft: {
    flex: 1,
  },
  earningsEyebrow: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: typography.letterSpacing.widest,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  earningsValue: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.sm,
  },
  earningsTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  earningsTrendText: {
    fontSize: typography.size.xs,
    color: colors.success,
    fontWeight: typography.weight.semibold,
  },
  earningsRight: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  earningsIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningsRightLabel: {
    fontSize: typography.size.xs,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: typography.weight.medium,
  },

  // ── Stats row
  statsRow: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  statCardBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  statValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    lineHeight: typography.lineHeight.lg,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
    fontWeight: typography.weight.medium,
  },

  // ── Boost banner
  boostWrapper: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.mustard,
  },
  boostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    minHeight: 62,
  },
  boostIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boostContent: {
    flex: 1,
  },
  boostTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    letterSpacing: typography.letterSpacing.tight,
  },
  boostSubtitle: {
    fontSize: typography.size.xs,
    color: 'rgba(0,0,0,0.5)',
    fontWeight: typography.weight.medium,
    marginTop: 2,
  },
  boostArrow: {
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

  // ── Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  actionBtn: {
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  actionIconWrap: {
    width: 58,
    height: 58,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  actionLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[700],
    textAlign: 'center',
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
  requestCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestClientName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.neutral[800],
    flex: 1,
  },
  requestBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  requestBadge: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  requestBadgeText: {
    fontSize: typography.size.xs - 1,
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.wide,
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

  // ── Activity feed
  activityList: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    ...shadows.card,
  },
  activityItem: {
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 52,
  },
  activityTimelineCol: {
    alignItems: 'center',
    width: 16,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  activityLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.neutral[100],
    marginTop: 4,
    marginBottom: 4,
  },
  activityContent: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  activityTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[800],
    marginBottom: 2,
    lineHeight: typography.lineHeight.sm,
  },
  activityTime: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
  },
});
