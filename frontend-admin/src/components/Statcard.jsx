/**
 * ============================================================
 * STAT CARD COMPONENT
 * ============================================================
 * Web adaptation of client-side StatWidget component.
 * Supports two variants:
 *  - Default (white card with colored icon background)
 *  - Gradient (colored gradient background with white text)
 * 
 * Props match StatWidget API from React Native codebase
 * ============================================================
 */

import { colors } from '../theme';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  gradient 
}) {
  const isGradient = Boolean(gradient);
  const trendPositive = trend > 0;

  return (
    <div style={{
      ...styles.container,
      background: isGradient
        ? `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`
        : colors.neutral[0],
      boxShadow: isGradient
        ? `0 8px 32px ${gradient[0]}44`
        : '0 1px 4px #0002',
    }}>
      
      {/* Background decoration (gradient variant only) */}
      {isGradient && <div style={styles.decoration} />}

      {/* Header row: Icon + Trend */}
      <div style={styles.header}>
        <div style={{
          ...styles.iconBox,
          background: isGradient 
            ? 'rgba(255,255,255,0.2)' 
            : colors.primary[50],
        }}>
          {icon}
        </div>
        
        {trend !== undefined && (
          <span style={{
            ...styles.trend,
            background: trendPositive
              ? (isGradient ? 'rgba(255,255,255,0.2)' : '#dcfce7')
              : (isGradient ? 'rgba(255,255,255,0.2)' : '#fee2e2'),
            color: trendPositive
              ? (isGradient ? '#fff' : '#15803d')
              : (isGradient ? '#fff' : '#991b1b'),
          }}>
            {trendPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={{
          ...styles.value,
          color: isGradient ? '#fff' : colors.neutral[900],
        }}>
          {value}
        </div>
        <div style={{
          ...styles.title,
          color: isGradient ? 'rgba(255,255,255,0.9)' : colors.neutral[700],
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{
            ...styles.subtitle,
            color: isGradient ? 'rgba(255,255,255,0.7)' : colors.neutral[500],
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    borderRadius: 16,
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
    minWidth: 180,
  },
  decoration: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  },
  trend: {
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 999,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  value: {
    fontSize: 28,
    fontWeight: 800,
    lineHeight: 1.1,
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
};