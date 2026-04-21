/**
 * ============================================================
 * SERVICE PROVIDERS MANAGEMENT PAGE
 * ============================================================
 * Admin view of all registered service providers:
 *  - Card grid with full profile info
 *  - Approve / Decline actions per provider
 *  - Status badge: Pending / Approved / Rejected
 *  - Search by name, email, phone
 *  - Filter by service category and status
 *  - Pagination (9 cards per page)
 * ============================================================
 */

import { useState } from 'react';
import { colors } from './theme';
import {
  INITIAL_PROVIDERS,
  PROVIDERS_PAGE_SIZE,
  PROVIDER_SERVICE_CATEGORIES,
} from './data/mockEntities';

const STATUS_CONFIG = {
  pending:  { bg: colors.accent.gold   + '20', color: colors.accent.gold,   label: 'Pending',  dot: colors.accent.gold   },
  approved: { bg: colors.accent.green  + '18', color: colors.accent.green,  label: 'Approved', dot: colors.accent.green  },
  rejected: { bg: colors.accent.coral  + '18', color: colors.accent.coral,  label: 'Rejected', dot: colors.accent.coral  },
};

const AVATAR_COLORS = [
  [colors.primary[500],  colors.primary[700]],
  [colors.accent.cyan,   colors.primary[500]],
  [colors.accent.purple, colors.primary[600]],
  [colors.accent.green,  colors.accent.cyan],
  [colors.accent.coral,  colors.accent.gold],
  [colors.accent.gold,   colors.accent.purple],
];

const CATEGORY_ICONS = {
  plumbing:    '🔧',
  electrical:  '⚡',
  cleaning:    '🧹',
  gardening:   '🌿',
  painting:    '🎨',
  carpentry:   '🪚',
  moving:      '📦',
  consulting:  '💼',
  other:       '🔨',
};

function StarRating({ rating }) {
  return (
    <span style={{ fontSize: 12, color: colors.accent.gold, fontWeight: 600 }}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))} {rating.toFixed(1)}
    </span>
  );
}

function ProviderCard({ provider, index, onApprove, onDecline }) {
  const [ac, ac2] = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const st = STATUS_CONFIG[provider.status] || STATUS_CONFIG.pending;
  const joined = new Date(provider.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const catIcon = CATEGORY_ICONS[provider.serviceCategory] || CATEGORY_ICONS.other;
  const isPending = provider.status === 'pending';

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.cardHeader}>
        <div style={{
          ...styles.avatar,
          background: `linear-gradient(135deg, ${ac}, ${ac2})`,
        }}>
          {provider.avatar}
        </div>
        <div style={styles.cardHeaderInfo}>
          <div style={styles.cardName}>{provider.fullName}</div>
          <div style={styles.businessName}>{provider.businessName}</div>
        </div>
        <div style={{
          ...styles.statusBadge,
          background: st.bg,
          color: st.color,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: st.dot,
            display: 'inline-block',
            marginRight: 5,
          }} />
          {st.label}
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Details */}
      <div style={styles.cardDetails}>
        <div style={styles.detailRow}>
          <span style={styles.detailIcon}>📧</span>
          <span style={styles.detailText}>{provider.email}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailIcon}>📱</span>
          <span style={styles.detailText}>{provider.phone}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailIcon}>📍</span>
          <span style={styles.detailText}>{provider.location}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailIcon}>{catIcon}</span>
          <span style={{
            ...styles.categoryChip,
            background: colors.primary[50],
            color: colors.primary[700],
          }}>
            {provider.serviceCategory.charAt(0).toUpperCase() + provider.serviceCategory.slice(1)}
          </span>
        </div>
      </div>

      {/* Rating + joined row */}
      <div style={styles.statsRow}>
        <div>
          <StarRating rating={provider.rating} />
          <div style={{ fontSize: 11, color: colors.neutral[400], marginTop: 2 }}>
            {provider.reviews} reviews
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.neutral[600] }}>Joined</div>
          <div style={{ fontSize: 11, color: colors.neutral[400] }}>{joined}</div>
        </div>
      </div>

      {/* Action buttons — only shown when pending or to re-decide */}
      <div style={styles.actions}>
        <button
          onClick={() => onApprove(provider.id)}
          disabled={provider.status === 'approved'}
          style={{
            ...styles.approveBtn,
            opacity: provider.status === 'approved' ? 0.5 : 1,
            cursor: provider.status === 'approved' ? 'default' : 'pointer',
          }}
          onMouseEnter={e => { if (provider.status !== 'approved') e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => { if (provider.status !== 'approved') e.currentTarget.style.opacity = '1'; }}
        >
          ✓ Approve
        </button>
        <button
          onClick={() => onDecline(provider.id)}
          disabled={provider.status === 'rejected'}
          style={{
            ...styles.declineBtn,
            opacity: provider.status === 'rejected' ? 0.5 : 1,
            cursor: provider.status === 'rejected' ? 'default' : 'pointer',
          }}
          onMouseEnter={e => { if (provider.status !== 'rejected') e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={e => { if (provider.status !== 'rejected') e.currentTarget.style.opacity = '1'; }}
        >
          ✕ Decline
        </button>
      </div>
    </div>
  );
}

export default function ProvidersPage() {
  const [providers, setProviders]         = useState(INITIAL_PROVIDERS);
  const [search, setSearch]               = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [page, setPage]                   = useState(1);

  const handleApprove = (id) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
  };
  const handleDecline = (id) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
  };

  const q = search.toLowerCase().trim();
  const filtered = providers.filter(p => {
    const matchSearch = !q ||
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.businessName.toLowerCase().includes(q);
    const matchCategory = categoryFilter === 'all' || p.serviceCategory === categoryFilter;
    const matchStatus   = statusFilter   === 'all' || p.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PROVIDERS_PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PROVIDERS_PAGE_SIZE, page * PROVIDERS_PAGE_SIZE);

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  // Summary counts
  const pendingCount  = providers.filter(p => p.status === 'pending').length;
  const approvedCount = providers.filter(p => p.status === 'approved').length;
  const rejectedCount = providers.filter(p => p.status === 'rejected').length;

  return (
    <div style={styles.container}>

      {/* Page header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Service Providers</h2>
          <p style={styles.pageSubtitle}>
            {filtered.length} provider{filtered.length !== 1 ? 's' : ''} shown
            {q || categoryFilter !== 'all' || statusFilter !== 'all' ? ' (filtered)' : ` · ${providers.length} total`}
          </p>
        </div>

        {/* Search bar */}
        <div style={styles.searchBar}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, phone..."
            style={styles.searchInput}
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} style={styles.clearBtn}>✕</button>
          )}
        </div>
      </div>

      {/* Summary badges */}
      <div style={styles.summaryRow}>
        <div style={{ ...styles.summaryChip, background: colors.accent.gold + '20', color: colors.accent.gold }}>
          ⏳ {pendingCount} Pending
        </div>
        <div style={{ ...styles.summaryChip, background: colors.accent.green + '18', color: colors.accent.green }}>
          ✓ {approvedCount} Approved
        </div>
        <div style={{ ...styles.summaryChip, background: colors.accent.coral + '18', color: colors.accent.coral }}>
          ✕ {rejectedCount} Rejected
        </div>
      </div>

      {/* Filters row */}
      <div style={styles.filtersRow}>
        {/* Category filter */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Service Category</label>
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            style={styles.filterSelect}
          >
            {PROVIDER_SERVICE_CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Status</label>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Clear filters */}
        {(q || categoryFilter !== 'all' || statusFilter !== 'all') && (
          <button onClick={resetFilters} style={styles.clearFiltersBtn}>
            Clear filters
          </button>
        )}
      </div>

      {/* Cards grid */}
      {paginated.length > 0 ? (
        <div style={styles.grid}>
          {paginated.map((provider, i) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              index={(page - 1) * PROVIDERS_PAGE_SIZE + i}
              onApprove={handleApprove}
              onDecline={handleDecline}
            />
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <div style={styles.emptyTitle}>No providers found</div>
          <div style={styles.emptySubtitle}>Try adjusting your search or filters</div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ ...styles.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
          >
            ← Prev
          </button>

          <div style={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                style={{
                  ...styles.pageNumber,
                  background: n === page
                    ? `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[500]})`
                    : colors.neutral[100],
                  color: n === page ? '#fff' : colors.neutral[700],
                  fontWeight: n === page ? 700 : 500,
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ ...styles.pageBtn, opacity: page === totalPages ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: colors.neutral[900],
    margin: 0,
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.neutral[500],
    margin: '4px 0 0',
  },
  summaryRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  summaryChip: {
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 700,
  },
  filtersRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.neutral[600],
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: 10,
    border: `1.5px solid ${colors.neutral[200]}`,
    background: colors.neutral[0],
    fontSize: 14,
    color: colors.neutral[700],
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'inherit',
  },
  clearFiltersBtn: {
    padding: '8px 16px',
    borderRadius: 10,
    border: `1.5px solid ${colors.accent.coral}`,
    background: 'transparent',
    color: colors.accent.coral,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-end',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: colors.neutral[0],
    border: `1.5px solid ${colors.neutral[200]}`,
    borderRadius: 12,
    padding: '10px 14px',
    minWidth: 300,
    boxShadow: '0 1px 4px #0001',
  },
  searchIcon: {
    fontSize: 15,
    color: colors.neutral[400],
    flexShrink: 0,
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 14,
    color: colors.neutral[800],
    width: '100%',
    fontFamily: 'inherit',
  },
  clearBtn: {
    border: 'none',
    background: colors.neutral[200],
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 11,
    color: colors.neutral[600],
    padding: '2px 6px',
    fontWeight: 700,
    flexShrink: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
    gap: 16,
  },

  // Card
  card: {
    background: colors.neutral[0],
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 1px 4px #0002',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 800,
    color: '#fff',
    flexShrink: 0,
  },
  cardHeaderInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  cardName: {
    fontSize: 15,
    fontWeight: 700,
    color: colors.neutral[900],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  businessName: {
    fontSize: 12,
    color: colors.primary[600],
    fontWeight: 600,
    marginTop: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    background: colors.neutral[100],
    marginBottom: 12,
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    marginBottom: 14,
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    fontSize: 14,
    width: 20,
    flexShrink: 0,
  },
  detailText: {
    fontSize: 12,
    color: colors.neutral[700],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  categoryChip: {
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '10px 0',
    borderTop: `1px solid ${colors.neutral[100]}`,
    borderBottom: `1px solid ${colors.neutral[100]}`,
    marginBottom: 12,
  },
  actions: {
    display: 'flex',
    gap: 8,
    marginTop: 2,
  },
  approveBtn: {
    flex: 1,
    padding: '8px 0',
    borderRadius: 10,
    border: 'none',
    background: `linear-gradient(135deg, ${colors.accent.green}, #059669)`,
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    transition: 'opacity 0.15s',
  },
  declineBtn: {
    flex: 1,
    padding: '8px 0',
    borderRadius: 10,
    border: `1.5px solid ${colors.accent.coral}`,
    background: 'transparent',
    color: colors.accent.coral,
    fontSize: 13,
    fontWeight: 700,
    transition: 'opacity 0.15s',
  },

  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '80px 24px',
    background: colors.neutral[0],
    borderRadius: 16,
    boxShadow: '0 1px 4px #0002',
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: colors.neutral[700], marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: colors.neutral[400] },

  // Pagination
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  pageBtn: {
    padding: '8px 18px',
    borderRadius: 10,
    border: `1.5px solid ${colors.neutral[200]}`,
    background: colors.neutral[0],
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    color: colors.neutral[700],
  },
  pageNumbers: { display: 'flex', gap: 6 },
  pageNumber: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
  },
};
