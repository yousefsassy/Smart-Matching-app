/**
 * ============================================================
 * CLIENTS MANAGEMENT PAGE
 * ============================================================
 * Admin view of all registered clients:
 *  - Card grid with full profile info
 *  - Real-time search by name, email, phone
 *  - Pagination (9 cards per page)
 * ============================================================
 */

import { useState } from 'react';
import { colors } from './theme';

// Mock client data
const MOCK_CLIENTS = [
  { id: 'c01', fullName: 'Emma Davis',       email: 'emma.davis@email.com',    phone: '+1 (555) 234-5678', location: 'New York, NY',      joinedAt: '2024-01-15', requests: 5,  status: 'active',   avatar: 'ED' },
  { id: 'c02', fullName: 'Lisa Park',        email: 'lisa.park@email.com',     phone: '+1 (555) 345-6789', location: 'Los Angeles, CA',   joinedAt: '2024-02-20', requests: 3,  status: 'active',   avatar: 'LP' },
  { id: 'c03', fullName: 'Sarah Chen',       email: 'sarah.chen@email.com',    phone: '+1 (555) 456-7890', location: 'San Francisco, CA', joinedAt: '2024-01-08', requests: 8,  status: 'active',   avatar: 'SC' },
  { id: 'c04', fullName: 'James Wilson',     email: 'j.wilson@email.com',      phone: '+1 (555) 567-8901', location: 'Chicago, IL',       joinedAt: '2024-03-02', requests: 2,  status: 'active',   avatar: 'JW' },
  { id: 'c05', fullName: 'Olivia Martinez',  email: 'o.martinez@email.com',    phone: '+1 (555) 678-9012', location: 'Miami, FL',         joinedAt: '2024-02-14', requests: 6,  status: 'active',   avatar: 'OM' },
  { id: 'c06', fullName: 'Noah Thompson',    email: 'noah.t@email.com',        phone: '+1 (555) 789-0123', location: 'Houston, TX',       joinedAt: '2024-01-30', requests: 4,  status: 'inactive', avatar: 'NT' },
  { id: 'c07', fullName: 'Ava Anderson',     email: 'ava.anderson@email.com',  phone: '+1 (555) 890-1234', location: 'Phoenix, AZ',       joinedAt: '2024-03-10', requests: 1,  status: 'active',   avatar: 'AA' },
  { id: 'c08', fullName: 'Liam Jackson',     email: 'liam.j@email.com',        phone: '+1 (555) 901-2345', location: 'Philadelphia, PA',  joinedAt: '2024-02-05', requests: 7,  status: 'active',   avatar: 'LJ' },
  { id: 'c09', fullName: 'Sophia White',     email: 's.white@email.com',       phone: '+1 (555) 012-3456', location: 'San Antonio, TX',   joinedAt: '2024-01-22', requests: 3,  status: 'active',   avatar: 'SW' },
  { id: 'c10', fullName: 'Ethan Harris',     email: 'ethan.h@email.com',       phone: '+1 (555) 123-4567', location: 'San Diego, CA',     joinedAt: '2024-03-18', requests: 2,  status: 'flagged',  avatar: 'EH' },
  { id: 'c11', fullName: 'Isabella Clark',   email: 'i.clark@email.com',       phone: '+1 (555) 234-5679', location: 'Dallas, TX',        joinedAt: '2024-02-28', requests: 9,  status: 'active',   avatar: 'IC' },
  { id: 'c12', fullName: 'Mason Lewis',      email: 'mason.lewis@email.com',   phone: '+1 (555) 345-6780', location: 'San Jose, CA',      joinedAt: '2024-01-10', requests: 0,  status: 'inactive', avatar: 'ML' },
  { id: 'c13', fullName: 'Mia Robinson',     email: 'mia.r@email.com',         phone: '+1 (555) 456-7891', location: 'Austin, TX',        joinedAt: '2024-03-05', requests: 4,  status: 'active',   avatar: 'MR' },
  { id: 'c14', fullName: 'Faten Amri',       email: 'faten@demo.com',          phone: '+216 20 123 456',   location: 'Tunis, Tunisia',    joinedAt: '2024-01-01', requests: 12, status: 'active',   avatar: 'FA' },
  { id: 'c15', fullName: 'Charlotte Young',  email: 'c.young@email.com',       phone: '+1 (555) 567-8902', location: 'Jacksonville, FL',  joinedAt: '2024-02-22', requests: 5,  status: 'active',   avatar: 'CY' },
];

const PAGE_SIZE = 9;

const STATUS_STYLES = {
  active:   { bg: colors.accent.green + '18',  color: colors.accent.green,  label: 'Active'   },
  inactive: { bg: colors.neutral[200],          color: colors.neutral[500],  label: 'Inactive' },
  flagged:  { bg: colors.accent.coral + '18',  color: colors.accent.coral,  label: 'Flagged'  },
};

const AVATAR_COLORS = [
  [colors.primary[500], colors.primary[700]],
  [colors.accent.cyan,  colors.primary[500]],
  [colors.accent.purple, colors.primary[600]],
  [colors.accent.green, colors.accent.cyan],
  [colors.accent.coral, colors.accent.gold],
];

function ClientCard({ client, index }) {
  const [ac, ac2] = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const st = STATUS_STYLES[client.status] || STATUS_STYLES.active;
  const joined = new Date(client.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={styles.card}>
      {/* Card header */}
      <div style={styles.cardHeader}>
        <div style={{
          ...styles.avatar,
          background: `linear-gradient(135deg, ${ac}, ${ac2})`,
        }}>
          {client.avatar}
        </div>
        <div style={styles.cardHeaderInfo}>
          <div style={styles.cardName}>{client.fullName}</div>
          <div style={styles.cardEmail}>{client.email}</div>
        </div>
        <div style={{
          ...styles.statusBadge,
          background: st.bg,
          color: st.color,
        }}>
          {st.label}
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Details */}
      <div style={styles.cardDetails}>
        <div style={styles.detailRow}>
          <span style={styles.detailIcon}>📱</span>
          <span style={styles.detailText}>{client.phone}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailIcon}>📍</span>
          <span style={styles.detailText}>{client.location}</span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailIcon}>📅</span>
          <span style={styles.detailText}>Joined {joined}</span>
        </div>
      </div>

      {/* Footer stat */}
      <div style={styles.cardFooter}>
        <div style={styles.footerStat}>
          <span style={{ fontSize: 18, fontWeight: 800, color: colors.primary[600] }}>{client.requests}</span>
          <span style={styles.footerLabel}>Requests</span>
        </div>
        <div style={styles.footerStat}>
          <span style={{ fontSize: 18, fontWeight: 800, color: colors.neutral[700] }}>#{client.id.replace('c', '')}</span>
          <span style={styles.footerLabel}>Client ID</span>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);

  const q = search.toLowerCase().trim();
  const filtered = MOCK_CLIENTS.filter(c =>
    !q ||
    c.fullName.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    c.phone.includes(q)
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div style={styles.container}>

      {/* Page header */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Clients Management</h2>
          <p style={styles.pageSubtitle}>
            {filtered.length} client{filtered.length !== 1 ? 's' : ''} found
            {q ? ` for "${search}"` : ` · ${MOCK_CLIENTS.length} total`}
          </p>
        </div>

        {/* Search bar */}
        <div style={styles.searchBar}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            style={styles.searchInput}
          />
          {search && (
            <button onClick={() => handleSearch('')} style={styles.clearBtn}>✕</button>
          )}
        </div>
      </div>

      {/* Cards grid */}
      {paginated.length > 0 ? (
        <div style={styles.grid}>
          {paginated.map((client, i) => (
            <ClientCard key={client.id} client={client} index={(page - 1) * PAGE_SIZE + i} />
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <div style={styles.emptyTitle}>No clients found</div>
          <div style={styles.emptySubtitle}>Try a different search term</div>
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
    gap: 24,
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
    transition: 'box-shadow 0.15s, transform 0.15s',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
  cardEmail: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
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
  },
  divider: {
    height: 1,
    background: colors.neutral[100],
    marginBottom: 14,
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 16,
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
    fontSize: 13,
    color: colors.neutral[700],
  },
  cardFooter: {
    display: 'flex',
    gap: 0,
    borderTop: `1px solid ${colors.neutral[100]}`,
    paddingTop: 14,
  },
  footerStat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  footerLabel: {
    fontSize: 11,
    color: colors.neutral[400],
    fontWeight: 500,
  },

  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '80px 24px',
    background: colors.neutral[0],
    borderRadius: 16,
    boxShadow: '0 1px 4px #0002',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.neutral[700],
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.neutral[400],
  },

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
    transition: 'all 0.15s',
  },
  pageNumbers: {
    display: 'flex',
    gap: 6,
  },
  pageNumber: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.15s',
  },
};
