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
import PrimaryButton from '../components/PrimaryButton';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import {
  SearchIcon,
  MatchIcon,
  HeartIcon,
  ClockIcon,
  MessageIcon,
  SparkleIcon,
  BellIcon,
} from '../components/Icons';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function ClientDashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleFindProviders = () => {
    navigation.navigate('CreateRequest');
  };

  const handleViewMatch = (matchName: string) => {
    Alert.alert('View Match', `Viewing details for ${matchName}`);
  };

  const handleMessageProvider = (providerName: string) => {
    Alert.alert('Message', `Opening chat with ${providerName}`);
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
          <View>
            <Text style={styles.greeting}>Hello, Faten </Text>
            <Text style={styles.tagline}>Let's find your perfect match today</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => Alert.alert('Notifications', 'You have 3 new notifications')}
          >
            <BellIcon size={24} color={colors.neutral[700]} />
            <Badge content={3} variant="notification" />
          </TouchableOpacity>
        </View>

        {/* AI Matching Hero Card */}
        <Card
          variant="gradient"
          gradientColors={[colors.accent.cyan, colors.primary[500]]}
          title="AI Smart Matching"
          subtitle="Get personalized provider recommendations powered by AI"
          icon={<SparkleIcon size={28} color={colors.neutral[0]} />}
          showArrow={true}
          onPress={handleFindProviders}
          style={styles.heroCard}
        />

        {/* Quick Stats */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <StatWidget
              variant="compact"
              title="Active Requests"
              value="4"
              icon={<ClockIcon size={20} color={colors.primary[600]} />}
            />
          </View>
          <View style={styles.statItem}>
            <StatWidget
              variant="compact"
              title="AI Matches"
              value="12"
              icon={<MatchIcon size={20} color={colors.accent.cyan} />}
            />
          </View>
          <View style={styles.statItem}>
            <StatWidget
              variant="compact"
              title="Saved"
              value="8"
              icon={<HeartIcon size={20} color={colors.accent.coral} />}
            />
          </View>
          <View style={styles.statItem}>
            <StatWidget
              variant="compact"
              title="Messages"
              value="5"
              icon={<MessageIcon size={20} color={colors.accent.purple} />}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFindProviders}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              style={styles.actionGradient}
            >
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
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <MatchIcon size={16} color={colors.accent.cyan} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>3 new AI matches available</Text>
              <Text style={styles.activityTime}>5 hours ago</Text>
            </View>
          </View>
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
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  greeting: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
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
  heroCard: {
    marginHorizontal: spacing.xl,
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
  matchesList: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  matchCard: {
    marginBottom: spacing.md,
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
