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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { useAuth } from '../context/AuthContext';
import { HomeStackParamList } from '../navigation/MainTabs';
import Card from '../components/Card';
import StatWidget from '../components/StatWidget';
import {
  BriefcaseIcon,
  TrendingUpIcon,
  MessageIcon,
  CalendarIcon,
  HeartIcon,
  SparkleIcon,
  BellIcon,
  UserIcon,
  ClockIcon,
} from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function ProviderDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleViewRequest = (clientName: string) => {
    navigation.navigate('IncomingRequests');
  };

  const handleManageServices = () => {
    navigation.navigate('MyServices');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Welcome, {user?.fullName?.split(' ')[0] || 'User'}!</Text>
            {user?.businessName && (
              <Text style={styles.businessName}>{user.businessName}</Text>
            )}
            <Text style={styles.tagline}>Let's grow your business today</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => Alert.alert('Notifications', 'You have 5 new notifications')}
          >
            <BellIcon size={24} color={colors.neutral[700]} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>5</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Performance Overview */}
        <View style={styles.performanceSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance Overview</Text>
            <TouchableOpacity onPress={() => Alert.alert('Analytics', 'View detailed analytics')}>
              <Text style={styles.seeAll}>Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statLarge}>
              <StatWidget
                variant="gradient"
                gradientColors={[colors.accent.cyan, colors.primary[500]]}
                title="This Month"
                value="$12.4K"
                subtitle="Revenue"
                icon={<TrendingUpIcon size={24} color={colors.neutral[0]} />}
                trend={{ value: 23, isPositive: true }}
              />
            </View>
            <View style={styles.statLarge}>
              <StatWidget
                variant="gradient"
                gradientColors={[colors.accent.purple, colors.primary[600]]}
                title="Match Score"
                value="4.9"
                subtitle="Average rating"
                icon={<SparkleIcon size={24} color={colors.neutral[0]} />}
                trend={{ value: 8, isPositive: true }}
              />
            </View>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <StatWidget
              variant="compact"
              title="Active Jobs"
              value="7"
              icon={<BriefcaseIcon size={20} color={colors.primary[600]} />}
            />
          </View>
          <View style={styles.statItem}>
            <StatWidget
              variant="compact"
              title="New Requests"
              value="15"
              icon={<ClockIcon size={20} color={colors.accent.gold} />}
            />
          </View>
          <View style={styles.statItem}>
            <StatWidget
              variant="compact"
              title="Messages"
              value="23"
              icon={<MessageIcon size={20} color={colors.accent.purple} />}
            />
          </View>
          <View style={styles.statItem}>
            <StatWidget
              variant="compact"
              title="Bookings"
              value="12"
              icon={<CalendarIcon size={20} color={colors.accent.cyan} />}
            />
          </View>
        </View>

        {/* AI Boost Card */}
        <Card
          variant="gradient"
          gradientColors={[colors.primary[500], colors.primary[700]]}
          title="Boost Your Visibility"
          subtitle="Let AI showcase your profile to more potential clients"
          icon={<SparkleIcon size={28} color={colors.neutral[0]} />}
          showArrow={true}
          onPress={() => Alert.alert('AI Boost', 'Upgrade your profile visibility with AI')}
          style={styles.boostCard}
        />

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleManageServices}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              style={styles.actionGradient}
            >
              <BriefcaseIcon size={24} color={colors.neutral[0]} />
            </LinearGradient>
            <Text style={styles.actionText}>Services</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Calendar', 'View your schedule')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.accent.cyan, colors.primary[500]]}
              style={styles.actionGradient}
            >
              <CalendarIcon size={24} color={colors.neutral[0]} />
            </LinearGradient>
            <Text style={styles.actionText}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Messages', 'View all conversations')}
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
            onPress={() => Alert.alert('Reviews', 'Manage your reviews')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.accent.gold, colors.accent.coral]}
              style={styles.actionGradient}
            >
              <HeartIcon size={24} color={colors.neutral[0]} />
            </LinearGradient>
            <Text style={styles.actionText}>Reviews</Text>
          </TouchableOpacity>
        </View>

        {/* New Requests */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Requests</Text>
          <TouchableOpacity onPress={() => Alert.alert('View All', 'See all requests')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.requestsList}>
          <Card
            title="Alex Johnson"
            subtitle="Looking for marketing consultation • Budget: $500-1000"
            icon={
              <View style={styles.avatarPlaceholder}>
                <UserIcon size={20} color={colors.primary[600]} />
              </View>
            }
            badge="NEW"
            onPress={() => handleViewRequest('Alex Johnson')}
            style={styles.requestCard}
          />
          <Card
            title="Emma Davis"
            subtitle="Need web development services • Budget: $2000-3000"
            icon={
              <View style={styles.avatarPlaceholder}>
                <UserIcon size={20} color={colors.primary[600]} />
              </View>
            }
            badge="HOT"
            onPress={() => handleViewRequest('Emma Davis')}
            style={styles.requestCard}
          />
          <Card
            title="David Miller"
            subtitle="Seeking business strategy advice • Budget: $800-1200"
            icon={
              <View style={styles.avatarPlaceholder}>
                <UserIcon size={20} color={colors.primary[600]} />
              </View>
            }
            onPress={() => handleViewRequest('David Miller')}
            style={styles.requestCard}
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
              <Text style={styles.activityTitle}>New message from Alex Johnson</Text>
              <Text style={styles.activityTime}>1 hour ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <CalendarIcon size={16} color={colors.accent.cyan} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Emma Davis booked a consultation</Text>
              <Text style={styles.activityTime}>3 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <HeartIcon size={16} color={colors.accent.coral} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>You received a 5-star review</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
        </View>

        {/* Bottom padding */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: 2,
  },
  businessName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.primary[600],
    marginBottom: 2,
  },
  tagline: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
  },
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.accent.coral,
    borderRadius: borderRadius.full,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral[50],
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
  performanceSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  seeAll: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary[600],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statLarge: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  statItem: {
    width: '48%',
  },
  boostCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
  },
  actionGradient: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  actionText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  requestsList: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  requestCard: {
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityList: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[800],
    marginBottom: 2,
  },
  activityTime: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
  },
});
