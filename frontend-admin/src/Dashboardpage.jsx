/**
 * ============================================================
 * ADMIN DASHBOARD PAGE
 * ============================================================
 * Overview page showing:
 *  - KPI stat cards (revenue, users, requests, completion rate)
 *  - Bar chart of monthly request volume
 *  - Real-time activity feed
 *  - Quick metric cards (clients, providers, pending reviews, etc.)
 * 
 * Mirrors client-side dashboard pattern: StatWidget grid + Card components
 * ============================================================
 */

import { colors, spacing } from './theme';
import StatCard from './components/Statcard';

// Mock analytics data (in production, fetch from API)
const MOCK_ANALYTICS = {
  revenue:    { value: '$48,200', trend: +18 },
  users:      { value: '1,284',   trend: +12 },
  requests:   { value: '342',     trend: +24 },
  completion: { value: '91%',     trend:  +3 },
};

const RECENT_ACTIVITY = [
  { id: 1, type: 'New User',       desc: 'Emma Davis registered as Provider',     time: '2 min ago',  icon: '👤', color: colors.accent.cyan  },
  { id: 2, type: 'New Request',    desc: 'Lisa Park created a Cleaning request',   time: '18 min ago', icon: '📋', color: colors.primary[500] },
  { id: 3, type: 'Request Done',   desc: "Sarah Chen's Plumbing job completed",    time: '1 hr ago',   icon: '✅', color: colors.accent.green  },
  { id: 4, type: 'User Flagged',   desc: 'David Miller flagged for review',        time: '3 hr ago',   icon: '⚠️', color: colors.accent.coral  },
  { id: 5, type: 'New Review',     desc: 'Michael Roberts received 5 ⭐ rating',   time: '5 hr ago',   icon: '⭐', color: colors.accent.gold   },
];

const CHART_DATA = [
  { month: 'Sep', requests: 28 },
  { month: 'Oct', requests: 35 },
  { month: 'Nov', requests: 42 },
  { month: 'Dec', requests: 38 },
  { month: 'Jan', requests: 55 },
  { month: 'Feb', requests: 61 },
];

export default function DashboardPage() {
  const stats = MOCK_ANALYTICS;
  const maxVal = Math.max(...CHART_DATA.map(d => d.requests));

  return (
    <div style={styles.container}>
      
      {/* KPI Cards - mirrors client StatWidget grid */}
      <div style={styles.kpiGrid}>
        <StatCard
          title="Total Revenue"
          value={stats.revenue.value}
          subtitle="This month"
          icon="💰"
          trend={stats.revenue.trend}
          gradient={[colors.primary[500], colors.primary[700]]}
        />
        <StatCard
          title="Total Users"
          value={stats.users.value}
          subtitle="Clients + Providers"
          icon="👥"
          trend={stats.users.trend}
          gradient={[colors.accent.cyan, colors.primary[500]]}
        />
        <StatCard
          title="Service Requests"
          value={stats.requests.value}
          subtitle="Last 30 days"
          icon="📋"
          trend={stats.requests.trend}
          gradient={[colors.accent.purple, colors.primary[600]]}
        />
        <StatCard
          title="Completion Rate"
          value={stats.completion.value}
          subtitle="Jobs finished"
          icon="✅"
          trend={stats.completion.trend}
          gradient={[colors.accent.green, colors.accent.cyan]}
        />
      </div>

      {/* Row: Chart + Activity Feed */}
      <div style={styles.chartsRow}>
        
        {/* Bar Chart - Requests Overview */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div style={styles.chartTitle}>Requests Overview</div>
            <div style={styles.chartSubtitle}>Monthly service request volume</div>
          </div>
          
          <div style={styles.chartBars}>
            {CHART_DATA.map(d => (
              <div key={d.month} style={styles.barColumn}>
                <div style={styles.barWrapper}>
                  <div
                    title={`${d.requests} requests`}
                    style={{
                      ...styles.bar,
                      height: `${(d.requests / maxVal) * 140}px`,
                    }}
                  >
                    <div style={styles.barValue}>{d.requests}</div>
                  </div>
                </div>
                <div style={styles.barLabel}>{d.month}</div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={styles.chartLegend}>
            <div style={styles.legendItem}>
              <div style={styles.legendColor} />
              <span style={styles.legendText}>Total Requests</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div style={styles.activityCard}>
          <div style={styles.activityTitle}>Recent Activity</div>
          <div style={styles.activityList}>
            {RECENT_ACTIVITY.map((activity, i) => (
              <div
                key={activity.id}
                style={{
                  ...styles.activityItem,
                  borderBottom: i < RECENT_ACTIVITY.length - 1 
                    ? `1px solid ${colors.neutral[100]}` 
                    : 'none',
                }}
              >
                <div style={{
                  ...styles.activityIcon,
                  background: activity.color + '22',
                }}>
                  {activity.icon}
                </div>
                <div style={styles.activityContent}>
                  <div style={{
                    ...styles.activityType,
                    color: activity.color,
                  }}>
                    {activity.type}
                  </div>
                  <div style={styles.activityDesc}>{activity.desc}</div>
                  <div style={styles.activityTime}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Row - compact metrics */}
      <div style={styles.quickStatsGrid}>
        {[
          { label: 'Active Clients',    value: '892',  icon: '👤', color: colors.primary[500] },
          { label: 'Active Providers',  value: '392',  icon: '🔧', color: colors.accent.cyan  },
          { label: 'Pending Reviews',   value: '12',   icon: '⏳', color: colors.accent.gold  },
          { label: 'Flagged Accounts',  value: '3',    icon: '🚩', color: colors.accent.coral },
          { label: 'Avg Match Score',   value: '94%',  icon: '✨', color: colors.accent.purple},
        ].map(stat => (
          <div key={stat.label} style={styles.quickStatCard}>
            <div style={{
              ...styles.quickStatIcon,
              background: stat.color + '18',
            }}>
              {stat.icon}
            </div>
            <div style={styles.quickStatInfo}>
              <div style={styles.quickStatValue}>{stat.value}</div>
              <div style={styles.quickStatLabel}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  
  // KPI Cards Grid
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },

  // Chart Row
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: 20,
  },

  // Chart Card
  chartCard: {
    background: colors.neutral[0],
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 1px 4px #0002',
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: colors.neutral[900],
  },
  chartSubtitle: {
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 2,
  },
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 12,
    height: 160,
  },
  barColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    height: '100%',
  },
  barWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    width: '100%',
  },
  bar: {
    background: `linear-gradient(to top, ${colors.primary[600]}, ${colors.primary[400]})`,
    borderRadius: '6px 6px 0 0',
    transition: 'height 0.4s ease',
    position: 'relative',
  },
  barValue: {
    position: 'absolute',
    top: -22,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 11,
    fontWeight: 700,
    color: colors.neutral[700],
    whiteSpace: 'nowrap',
  },
  barLabel: {
    fontSize: 11,
    color: colors.neutral[500],
    fontWeight: 600,
  },
  chartLegend: {
    display: 'flex',
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
    background: colors.primary[500],
  },
  legendText: {
    fontSize: 12,
    color: colors.neutral[600],
  },

  // Activity Card
  activityCard: {
    background: colors.neutral[0],
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 1px 4px #0002',
    overflowY: 'auto',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: colors.neutral[900],
    marginBottom: 20,
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  activityItem: {
    display: 'flex',
    gap: 12,
    padding: '12px 0',
    alignItems: 'flex-start',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityType: {
    fontSize: 12,
    fontWeight: 700,
  },
  activityDesc: {
    fontSize: 13,
    color: colors.neutral[700],
    lineHeight: 1.4,
    marginTop: 1,
  },
  activityTime: {
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: 3,
  },

  // Quick Stats Grid
  quickStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
  },
  quickStatCard: {
    background: colors.neutral[0],
    borderRadius: 14,
    padding: '16px 20px',
    boxShadow: '0 1px 4px #0002',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
  quickStatInfo: {
    flex: 1,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: 800,
    color: colors.neutral[900],
  },
  quickStatLabel: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: 500,
  },
};