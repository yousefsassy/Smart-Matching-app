/**
 * ============================================================
 * ADMIN DASHBOARD PAGE
 * ============================================================
 * Overview page showing:
 *  - KPI stat cards (revenue, users, requests, completion rate)
 *  - Bar chart of monthly request volume
 *  - Real-time activity feed
 *  - Quick metric cards (clients, providers, pending reviews, etc.)
 * ============================================================
 */

import { colors } from './theme';
import StatCard from './components/StatCard';
import {
  DASHBOARD_ANALYTICS,
  DASHBOARD_CHART_DATA,
  DASHBOARD_RECENT_ACTIVITY,
} from './data/appShellData';

const ACTIVITY_COLORS = [
  colors.accent.cyan,
  colors.primary[500],
  colors.accent.green,
  colors.accent.coral,
  colors.accent.gold,
];

export default function DashboardPage() {
  const maxVal = Math.max(...DASHBOARD_CHART_DATA.map((item) => item.requests));

  return (
    <div style={styles.container}>
      <div style={styles.kpiGrid}>
        <StatCard
          title="Total Revenue"
          value={DASHBOARD_ANALYTICS.revenue.value}
          subtitle="This month"
          icon="💰"
          trend={DASHBOARD_ANALYTICS.revenue.trend}
          gradient={[colors.primary[500], colors.primary[700]]}
        />
        <StatCard
          title="Total Users"
          value={DASHBOARD_ANALYTICS.users.value}
          subtitle="Clients + Providers"
          icon="👥"
          trend={DASHBOARD_ANALYTICS.users.trend}
          gradient={[colors.accent.cyan, colors.primary[500]]}
        />
        <StatCard
          title="Service Requests"
          value={DASHBOARD_ANALYTICS.requests.value}
          subtitle="Last 30 days"
          icon="📋"
          trend={DASHBOARD_ANALYTICS.requests.trend}
          gradient={[colors.accent.purple, colors.primary[600]]}
        />
        <StatCard
          title="Completion Rate"
          value={DASHBOARD_ANALYTICS.completion.value}
          subtitle="Jobs finished"
          icon="✅"
          trend={DASHBOARD_ANALYTICS.completion.trend}
          gradient={[colors.accent.green, colors.accent.cyan]}
        />
      </div>

      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <div style={styles.chartTitle}>Requests Overview</div>
            <div style={styles.chartSubtitle}>Monthly service request volume</div>
          </div>

          <div style={styles.chartBars}>
            {DASHBOARD_CHART_DATA.map((entry) => (
              <div key={entry.month} style={styles.barColumn}>
                <div style={styles.barWrapper}>
                  <div
                    title={`${entry.requests} requests`}
                    style={{
                      ...styles.bar,
                      height: `${(entry.requests / maxVal) * 140}px`,
                    }}
                  >
                    <div style={styles.barValue}>{entry.requests}</div>
                  </div>
                </div>
                <div style={styles.barLabel}>{entry.month}</div>
              </div>
            ))}
          </div>

          <div style={styles.chartLegend}>
            <div style={styles.legendItem}>
              <div style={styles.legendColor} />
              <span style={styles.legendText}>Total Requests</span>
            </div>
          </div>
        </div>

        <div style={styles.activityCard}>
          <div style={styles.activityTitle}>Recent Activity</div>
          <div style={styles.activityList}>
            {DASHBOARD_RECENT_ACTIVITY.map((activity, index) => {
              const color = ACTIVITY_COLORS[index] || colors.primary[500];
              return (
                <div
                  key={activity.id}
                  style={{
                    ...styles.activityItem,
                    borderBottom:
                      index < DASHBOARD_RECENT_ACTIVITY.length - 1
                        ? `1px solid ${colors.neutral[100]}`
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      ...styles.activityIcon,
                      background: `${color}22`,
                    }}
                  >
                    {activity.icon}
                  </div>
                  <div style={styles.activityContent}>
                    <div style={{ ...styles.activityType, color }}>{activity.type}</div>
                    <div style={styles.activityDesc}>{activity.desc}</div>
                    <div style={styles.activityTime}>{activity.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={styles.quickStatsGrid}>
        {[
          { label: 'Active Clients', value: '892', icon: '👤', color: colors.primary[500] },
          { label: 'Active Providers', value: '392', icon: '🔧', color: colors.accent.cyan },
          { label: 'Pending Reviews', value: '12', icon: '⏳', color: colors.accent.gold },
          { label: 'Flagged Accounts', value: '3', icon: '🚩', color: colors.accent.coral },
          { label: 'Avg Match Score', value: '94%', icon: '✨', color: colors.accent.purple },
        ].map((stat) => (
          <div key={stat.label} style={styles.quickStatCard}>
            <div
              style={{
                ...styles.quickStatIcon,
                background: `${stat.color}18`,
              }}
            >
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
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: 20,
  },
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
