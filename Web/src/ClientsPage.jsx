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

import { useEffect, useState } from 'react';
import { colors } from './theme';
import { CLIENTS_PAGE_SIZE } from './data/mockEntities';
import { getClients } from './services/adminService';

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
  const [clients, setClients] = useState([]);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadClients = async () => {
    setLoading(true);
    setError('');

    try {
      const nextClients = await getClients();
      setClients(nextClients);
    } catch (err) {
      setError(err.message || 'Unable to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const q = search.toLowerCase().trim();
  const filtered = clients.filter(c =>
    !q ||
    c.fullName.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    c.phone.includes(q)
  );

  const totalPages = Math.ceil(filtered.length / CLIENTS_PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * CLIENTS_PAGE_SIZE, page * CLIENTS_PAGE_SIZE);

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
            {q ? ` for "${search}"` : ` · ${clients.length} total`}
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
      {loading ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyTitle}>Loading clients...</div>
        </div>
      ) : error ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyTitle}>Could not load clients</div>
          <div style={styles.emptySubtitle}>{error}</div>
          <button onClick={loadClients} style={styles.retryBtn}>Retry</button>
        </div>
      ) : paginated.length > 0 ? (
        <div style={styles.grid}>
          {paginated.map((client, i) => (
            <ClientCard key={client.id} client={client} index={(page - 1) * CLIENTS_PAGE_SIZE + i} />
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
  retryBtn: {
    marginTop: 14,
    padding: '8px 16px',
    borderRadius: 10,
    border: 'none',
    background: colors.primary[600],
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
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
