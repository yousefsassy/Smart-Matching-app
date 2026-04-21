/**
 * ============================================================
 * REQUESTS MANAGEMENT PAGE
 * ============================================================
 * Full lifecycle tracking for all service requests:
 *  - Client → Request → Provider relationship view
 *  - Status badges: Pending / Assigned / In Progress /
 *                   Completed / Cancelled / Rejected
 *  - Expandable detail panel per request
 *  - Search by client, provider, or request ID
 *  - Filter by status, category, sort order
 *  - Summary stat strip at the top
 * ============================================================
 */

import { useState } from 'react';
import { colors } from './theme';

// ── Mock data ──────────────────────────────────────────────
const MOCK_REQUESTS = [
  {
    id: 'REQ-001',
    clientName: 'Emma Davis',        clientEmail: 'emma.davis@email.com',   clientPhone: '+1 (555) 234-5678',
    providerName: 'Michael Roberts', providerBusiness: 'Roberts Plumbing',  providerPhone: '+1 (555) 222-3333',
    serviceCategory: 'plumbing',
    description: 'Bathroom faucet leaking badly, needs urgent repair and pipe inspection.',
    location: 'New York, NY',
    scheduledDate: '2024-03-20', scheduledTime: '10:00 – 12:00',
    budget: { min: 80,  max: 150 },
    status: 'completed',
    rating: 5,
    commentaire: 'Michael was very professional and fixed the issue quickly. Highly recommend!',
    createdAt: '2024-03-14T09:30:00',
    statusHistory: ['pending', 'assigned', 'in_progress', 'completed'],
  },
  {
    id: 'REQ-002',
    clientName: 'Lisa Park',         clientEmail: 'lisa.park@email.com',    clientPhone: '+1 (555) 345-6789',
    providerName: 'Emma Williams',   providerBusiness: 'Williams Electric',  providerPhone: '+1 (555) 333-4444',
    serviceCategory: 'electrical',
    description: 'Circuit breaker keeps tripping in the kitchen. Need full diagnosis.',
    location: 'Los Angeles, CA',
    scheduledDate: '2024-03-22', scheduledTime: '14:00 – 16:00',
    budget: { min: 120, max: 250 },
    status: 'in_progress',
    rating: null,
    createdAt: '2024-03-18T11:15:00',
    statusHistory: ['pending', 'assigned', 'in_progress'],
  },
  {
    id: 'REQ-003',
    clientName: 'Sarah Chen',        clientEmail: 'sarah.chen@email.com',   clientPhone: '+1 (555) 456-7890',
    providerName: 'Carlos Mendez',   providerBusiness: 'Sparkle Clean Co.', providerPhone: '+1 (555) 444-5555',
    serviceCategory: 'cleaning',
    description: 'Deep cleaning for 3-bedroom apartment before moving out.',
    location: 'San Francisco, CA',
    scheduledDate: '2024-03-25', scheduledTime: '09:00 – 13:00',
    budget: { min: 200, max: 350 },
    status: 'assigned',
    rating: null,
    createdAt: '2024-03-19T08:00:00',
    statusHistory: ['pending', 'assigned'],
  },
  {
    id: 'REQ-004',
    clientName: 'James Wilson',      clientEmail: 'j.wilson@email.com',     clientPhone: '+1 (555) 567-8901',
    providerName: null,              providerBusiness: null,                 providerPhone: null,
    serviceCategory: 'gardening',
    description: 'Lawn maintenance, hedge trimming, and garden bed setup.',
    location: 'Chicago, IL',
    scheduledDate: '2024-03-28', scheduledTime: '08:00 – 11:00',
    budget: { min: 60,  max: 100 },
    status: 'pending',
    rating: null,
    createdAt: '2024-03-20T14:45:00',
    statusHistory: ['pending'],
  },
  {
    id: 'REQ-005',
    clientName: 'Olivia Martinez',   clientEmail: 'o.martinez@email.com',   clientPhone: '+1 (555) 678-9012',
    providerName: 'David Kim',       providerBusiness: 'Kim Premium Painting', providerPhone: '+1 (555) 666-7777',
    serviceCategory: 'painting',
    description: 'Interior painting for living room and two bedrooms. Light grey color.',
    location: 'Miami, FL',
    scheduledDate: '2024-03-15', scheduledTime: '08:00 – 17:00',
    budget: { min: 400, max: 700 },
    status: 'completed',
    rating: 4,
    commentaire: 'Good work overall, the colors look great. Took a bit longer than expected but the quality is there.',
    createdAt: '2024-03-08T10:00:00',
    statusHistory: ['pending', 'assigned', 'in_progress', 'completed'],
  },
  {
    id: 'REQ-006',
    clientName: 'Noah Thompson',     clientEmail: 'noah.t@email.com',       clientPhone: '+1 (555) 789-0123',
    providerName: null,              providerBusiness: null,                 providerPhone: null,
    serviceCategory: 'carpentry',
    description: 'Custom built-in bookshelf for home office, walnut finish.',
    location: 'Houston, TX',
    scheduledDate: '2024-04-02', scheduledTime: '10:00 – 15:00',
    budget: { min: 300, max: 500 },
    status: 'pending',
    rating: null,
    createdAt: '2024-03-21T16:20:00',
    statusHistory: ['pending'],
  },
  {
    id: 'REQ-007',
    clientName: 'Ava Anderson',      clientEmail: 'ava.anderson@email.com', clientPhone: '+1 (555) 890-1234',
    providerName: 'Sophie Turner',   providerBusiness: 'Turner Moving Services', providerPhone: '+1 (555) 777-8888',
    serviceCategory: 'moving',
    description: 'Full apartment move, 2BR, ground to 4th floor. Need 2 helpers.',
    location: 'Phoenix, AZ',
    scheduledDate: '2024-03-30', scheduledTime: '07:00 – 14:00',
    budget: { min: 250, max: 400 },
    status: 'assigned',
    rating: null,
    createdAt: '2024-03-19T12:00:00',
    statusHistory: ['pending', 'assigned'],
  },
  {
    id: 'REQ-008',
    clientName: 'Liam Jackson',      clientEmail: 'liam.j@email.com',       clientPhone: '+1 (555) 901-2345',
    providerName: 'Nina Johansson',  providerBusiness: 'Nordic Clean Pros', providerPhone: '+1 (555) 999-0000',
    serviceCategory: 'cleaning',
    description: 'Weekly office cleaning contract, 500 sqft space.',
    location: 'Philadelphia, PA',
    scheduledDate: '2024-03-18', scheduledTime: '18:00 – 20:00',
    budget: { min: 80,  max: 120 },
    status: 'completed',
    rating: 5,
    commentaire: 'Nina and her team did an outstanding job. The office has never been cleaner. Will definitely book again.',
    createdAt: '2024-03-10T09:00:00',
    statusHistory: ['pending', 'assigned', 'in_progress', 'completed'],
  },
  {
    id: 'REQ-009',
    clientName: 'Sophia White',      clientEmail: 's.white@email.com',      clientPhone: '+1 (555) 012-3456',
    providerName: 'Firas Saidi',     providerBusiness: 'Saidi Consulting',  providerPhone: '+216 55 111 222',
    serviceCategory: 'consulting',
    description: 'Business plan review and market analysis for startup launch.',
    location: 'San Antonio, TX',
    scheduledDate: '2024-03-23', scheduledTime: '11:00 – 13:00',
    budget: { min: 150, max: 300 },
    status: 'in_progress',
    rating: null,
    createdAt: '2024-03-17T14:30:00',
    statusHistory: ['pending', 'assigned', 'in_progress'],
  },
  {
    id: 'REQ-010',
    clientName: 'Ethan Harris',      clientEmail: 'ethan.h@email.com',      clientPhone: '+1 (555) 123-4567',
    providerName: 'Rachel Green',    providerBusiness: 'Green Electric',    providerPhone: '+1 (555) 011-2222',
    serviceCategory: 'electrical',
    description: 'Smart home installation: lighting automation and smart locks.',
    location: 'San Diego, CA',
    scheduledDate: '2024-03-12', scheduledTime: '09:00 – 17:00',
    budget: { min: 500, max: 900 },
    status: 'cancelled',
    rating: null,
    createdAt: '2024-03-05T08:15:00',
    statusHistory: ['pending', 'assigned', 'cancelled'],
  },
  {
    id: 'REQ-011',
    clientName: 'Isabella Clark',    clientEmail: 'i.clark@email.com',      clientPhone: '+1 (555) 234-5679',
    providerName: 'Michael Roberts', providerBusiness: 'Roberts Plumbing',  providerPhone: '+1 (555) 222-3333',
    serviceCategory: 'plumbing',
    description: 'Water heater replacement and full bathroom re-plumbing.',
    location: 'Dallas, TX',
    scheduledDate: '2024-03-26', scheduledTime: '10:00 – 14:00',
    budget: { min: 400, max: 600 },
    status: 'in_progress',
    rating: null,
    createdAt: '2024-03-20T10:00:00',
    statusHistory: ['pending', 'assigned', 'in_progress'],
  },
  {
    id: 'REQ-012',
    clientName: 'Mia Robinson',      clientEmail: 'mia.r@email.com',        clientPhone: '+1 (555) 456-7891',
    providerName: 'Aisha Patel',     providerBusiness: 'Green Thumb Gardens', providerPhone: '+1 (555) 555-6666',
    serviceCategory: 'gardening',
    description: 'Backyard landscaping redesign with native plants and irrigation.',
    location: 'Austin, TX',
    scheduledDate: '2024-03-16', scheduledTime: '08:00 – 16:00',
    budget: { min: 600, max: 1000 },
    status: 'completed',
    rating: 5,
    commentaire: 'Aisha transformed our backyard completely. The native plants are beautiful and the irrigation works perfectly.',
    createdAt: '2024-03-09T11:00:00',
    statusHistory: ['pending', 'assigned', 'in_progress', 'completed'],
  },
  {
    id: 'REQ-013',
    clientName: 'Faten Amri',        clientEmail: 'faten@demo.com',         clientPhone: '+216 20 123 456',
    providerName: null,              providerBusiness: null,                 providerPhone: null,
    serviceCategory: 'cleaning',
    description: 'Post-construction cleaning for newly renovated villa.',
    location: 'Tunis, Tunisia',
    scheduledDate: '2024-04-05', scheduledTime: '09:00 – 15:00',
    budget: { min: 150, max: 250 },
    status: 'pending',
    rating: null,
    createdAt: '2024-03-22T09:00:00',
    statusHistory: ['pending'],
  },
  {
    id: 'REQ-014',
    clientName: 'Charlotte Young',   clientEmail: 'c.young@email.com',      clientPhone: '+1 (555) 567-8902',
    providerName: 'David Kim',       providerBusiness: 'Kim Premium Painting', providerPhone: '+1 (555) 666-7777',
    serviceCategory: 'painting',
    description: 'Exterior house painting, 2-storey, white and grey trim.',
    location: 'Jacksonville, FL',
    scheduledDate: '2024-03-10', scheduledTime: '07:00 – 18:00',
    budget: { min: 800, max: 1200 },
    status: 'rejected',
    rating: null,
    createdAt: '2024-03-04T13:00:00',
    statusHistory: ['pending', 'rejected'],
  },
  {
    id: 'REQ-015',
    clientName: 'Mason Lewis',       clientEmail: 'mason.lewis@email.com',  clientPhone: '+1 (555) 345-6780',
    providerName: 'Emma Williams',   providerBusiness: 'Williams Electric',  providerPhone: '+1 (555) 333-4444',
    serviceCategory: 'electrical',
    description: 'Generator installation and electrical panel upgrade.',
    location: 'San Jose, CA',
    scheduledDate: '2024-03-08', scheduledTime: '08:00 – 14:00',
    budget: { min: 700, max: 1100 },
    status: 'completed',
    rating: 4,
    commentaire: 'Rachel did a solid job with the generator and panel upgrade. Very knowledgeable and explained everything clearly.',
    createdAt: '2024-03-01T07:30:00',
    statusHistory: ['pending', 'assigned', 'in_progress', 'completed'],
  },
  {
    id: 'REQ-016',
    clientName: 'Sarah Chen',        clientEmail: 'sarah.chen@email.com',   clientPhone: '+1 (555) 456-7890',
    providerName: null,              providerBusiness: null,                 providerPhone: null,
    serviceCategory: 'carpentry',
    description: 'Kitchen cabinet installation, 10 units, modern style.',
    location: 'San Francisco, CA',
    scheduledDate: '2024-04-10', scheduledTime: '08:00 – 17:00',
    budget: { min: 900, max: 1500 },
    status: 'pending',
    rating: null,
    createdAt: '2024-03-22T15:30:00',
    statusHistory: ['pending'],
  },
  {
    id: 'REQ-017',
    clientName: 'James Wilson',      clientEmail: 'j.wilson@email.com',     clientPhone: '+1 (555) 567-8901',
    providerName: 'Carlos Mendez',   providerBusiness: 'Sparkle Clean Co.', providerPhone: '+1 (555) 444-5555',
    serviceCategory: 'cleaning',
    description: 'Move-in cleaning for new apartment, 4 rooms.',
    location: 'Chicago, IL',
    scheduledDate: '2024-03-13', scheduledTime: '10:00 – 14:00',
    budget: { min: 120, max: 180 },
    status: 'cancelled',
    rating: null,
    createdAt: '2024-03-07T09:00:00',
    statusHistory: ['pending', 'assigned', 'cancelled'],
  },
  {
    id: 'REQ-018',
    clientName: 'Liam Jackson',      clientEmail: 'liam.j@email.com',       clientPhone: '+1 (555) 901-2345',
    providerName: 'Ahmed Benali',    providerBusiness: 'Benali Plumbing',   providerPhone: '+216 50 222 333',
    serviceCategory: 'plumbing',
    description: 'New bathroom installation from scratch including tiling.',
    location: 'Philadelphia, PA',
    scheduledDate: '2024-03-29', scheduledTime: '08:00 – 17:00',
    budget: { min: 1200, max: 2000 },
    status: 'assigned',
    rating: null,
    createdAt: '2024-03-21T11:00:00',
    statusHistory: ['pending', 'assigned'],
  },
];

// ── Constants ──────────────────────────────────────────────
const STATUSES = ['all', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'rejected'];
const CATEGORIES = ['all', 'plumbing', 'electrical', 'cleaning', 'gardening', 'painting', 'carpentry', 'moving', 'consulting'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'status', label: 'By status'   },
];

const PAGE_SIZE = 8;

const STATUS_CONFIG = {
  pending:     { bg: colors.accent.gold  + '22', color: colors.accent.gold,   label: 'Pending',     dot: colors.accent.gold,   icon: '⏳' },
  assigned:    { bg: colors.accent.cyan  + '22', color: colors.accent.cyan,   label: 'Assigned',    dot: colors.accent.cyan,   icon: '👤' },
  in_progress: { bg: colors.primary[100],        color: colors.primary[600],  label: 'In Progress', dot: colors.primary[500],  icon: '🔄' },
  completed:   { bg: colors.accent.green + '1a', color: colors.accent.green,  label: 'Completed',   dot: colors.accent.green,  icon: '✅' },
  cancelled:   { bg: colors.neutral[200],        color: colors.neutral[500],  label: 'Cancelled',   dot: colors.neutral[400],  icon: '🚫' },
  rejected:    { bg: colors.accent.coral + '1a', color: colors.accent.coral,  label: 'Rejected',    dot: colors.accent.coral,  icon: '✕'  },
};

const CATEGORY_ICONS = {
  plumbing: '🔧', electrical: '⚡', cleaning: '🧹', gardening: '🌿',
  painting: '🎨', carpentry: '🪚', moving: '📦', consulting: '💼', other: '🔨',
};

const STATUS_SORT_ORDER = { pending: 0, assigned: 1, in_progress: 2, completed: 3, cancelled: 4, rejected: 5 };

// ── Helpers ────────────────────────────────────────────────
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtDateTime(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Summary stat strip ─────────────────────────────────────
function SummaryStrip({ requests }) {
  const counts = STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = requests.filter(r => r.status === s).length;
    return acc;
  }, {});
  return (
    <div style={stripStyles.row}>
      {STATUSES.slice(1).map(s => {
        const cfg = STATUS_CONFIG[s];
        return (
          <div key={s} style={{ ...stripStyles.chip, background: cfg.bg, color: cfg.color }}>
            <span>{cfg.icon}</span>
            <span style={{ fontWeight: 700 }}>{counts[s]}</span>
            <span style={{ fontWeight: 500, opacity: 0.85 }}>{cfg.label}</span>
          </div>
        );
      })}
    </div>
  );
}

const stripStyles = {
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
};

// ── Status badge ───────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '4px 10px',
      borderRadius: 20,
      background: cfg.bg,
      color: cfg.color,
      fontSize: 11,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6,
        borderRadius: '50%',
        background: cfg.dot,
        display: 'inline-block',
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
}

// ── Status history track ───────────────────────────────────
function StatusTrack({ history }) {
  const steps = ['pending', 'assigned', 'in_progress', 'completed'];
  const isCancelled = history.includes('cancelled');
  const isRejected  = history.includes('rejected');

  if (isCancelled || isRejected) {
    const endLabel = isCancelled ? 'Cancelled' : 'Rejected';
    const endColor = isCancelled ? colors.neutral[400] : colors.accent.coral;
    return (
      <div style={trackStyles.row}>
        {history.map((s, i) => {
          const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.pending;
          return (
            <div key={i} style={trackStyles.item}>
              <div style={{ ...trackStyles.dot, background: cfg.dot }} />
              {i < history.length - 1 && <div style={{ ...trackStyles.line, background: endColor + '44' }} />}
              <span style={{ ...trackStyles.label, color: cfg.color }}>{cfg.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={trackStyles.row}>
      {steps.map((s, i) => {
        const done = history.includes(s);
        const cfg  = STATUS_CONFIG[s];
        return (
          <div key={s} style={trackStyles.item}>
            <div style={{
              ...trackStyles.dot,
              background: done ? cfg.dot : colors.neutral[200],
              boxShadow: done ? `0 0 0 3px ${cfg.dot}22` : 'none',
            }} />
            {i < steps.length - 1 && (
              <div style={{
                ...trackStyles.line,
                background: done && history.includes(steps[i + 1])
                  ? `linear-gradient(90deg, ${cfg.dot}, ${STATUS_CONFIG[steps[i + 1]].dot})`
                  : colors.neutral[200],
              }} />
            )}
            <span style={{
              ...trackStyles.label,
              color: done ? cfg.color : colors.neutral[300],
              fontWeight: done ? 700 : 400,
            }}>
              {cfg.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const trackStyles = {
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0,
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    marginBottom: 4,
    flexShrink: 0,
    transition: 'background 0.2s',
    zIndex: 1,
  },
  line: {
    position: 'absolute',
    top: 4,
    left: '50%',
    width: '100%',
    height: 2,
    borderRadius: 2,
    zIndex: 0,
  },
  label: {
    fontSize: 10,
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
};

// ── Request card ───────────────────────────────────────────
function RequestCard({ request, expanded, onToggle }) {
  const catIcon = CATEGORY_ICONS[request.serviceCategory] || CATEGORY_ICONS.other;
  const catLabel = request.serviceCategory.charAt(0).toUpperCase() + request.serviceCategory.slice(1);
  const hasProvider = !!request.providerName;

  return (
    <div style={{
      ...cardStyles.wrapper,
      borderLeft: `3px solid ${(STATUS_CONFIG[request.status] || STATUS_CONFIG.pending).dot}`,
    }}>
      {/* ── Top row: ID + category + status + date ── */}
      <div style={cardStyles.topRow}>
        <div style={cardStyles.idBlock}>
          <span style={cardStyles.catIcon}>{catIcon}</span>
          <div>
            <span style={cardStyles.reqId}>{request.id}</span>
            <span style={cardStyles.catLabel}>{catLabel}</span>
          </div>
        </div>
        <div style={cardStyles.topRight}>
          <StatusBadge status={request.status} />
          <span style={cardStyles.dateText}>
            📅 {fmtDate(request.createdAt)}
          </span>
          <button
            onClick={onToggle}
            style={{
              ...cardStyles.expandBtn,
              background: expanded ? colors.primary[50] : colors.neutral[100],
              color:      expanded ? colors.primary[600] : colors.neutral[600],
            }}
          >
            {expanded ? '▲ Hide' : '▼ Details'}
          </button>
        </div>
      </div>

      {/* ── Main row: Client → Provider ── */}
      <div style={cardStyles.relationRow}>
        {/* Client block */}
        <div style={cardStyles.partyBlock}>
          <div style={{ ...cardStyles.partyLabel, color: colors.primary[500] }}>CLIENT</div>
          <div style={cardStyles.partyName}>{request.clientName}</div>
          <div style={cardStyles.partyDetail}>📧 {request.clientEmail}</div>
          <div style={cardStyles.partyDetail}>📱 {request.clientPhone}</div>
        </div>

        {/* Arrow */}
        <div style={cardStyles.arrowBlock}>
          <div style={cardStyles.arrowLine} />
          <div style={cardStyles.arrowHead}>→</div>
        </div>

        {/* Provider block */}
        <div style={cardStyles.partyBlock}>
          <div style={{ ...cardStyles.partyLabel, color: colors.accent.cyan }}>PROVIDER</div>
          {hasProvider ? (
            <>
              <div style={cardStyles.partyName}>{request.providerName}</div>
              <div style={{ ...cardStyles.partyDetail, color: colors.primary[600], fontWeight: 600 }}>
                {request.providerBusiness}
              </div>
              <div style={cardStyles.partyDetail}>📱 {request.providerPhone}</div>
            </>
          ) : (
            <div style={cardStyles.unassigned}>⏳ Not yet assigned</div>
          )}
        </div>

        {/* Meta: location + schedule + budget */}
        <div style={cardStyles.metaBlock}>
          <div style={cardStyles.metaRow}>
            <span style={cardStyles.metaIcon}>📍</span>
            <span style={cardStyles.metaText}>{request.location}</span>
          </div>
          <div style={cardStyles.metaRow}>
            <span style={cardStyles.metaIcon}>🗓</span>
            <span style={cardStyles.metaText}>{fmtDate(request.scheduledDate)}</span>
          </div>
          <div style={cardStyles.metaRow}>
            <span style={cardStyles.metaIcon}>🕐</span>
            <span style={cardStyles.metaText}>{request.scheduledTime}</span>
          </div>
          {request.budget && (
            <div style={cardStyles.metaRow}>
              <span style={cardStyles.metaIcon}>💰</span>
              <span style={cardStyles.metaText}>${request.budget.min}–${request.budget.max}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Expanded detail panel ── */}
      {expanded && (
        <div style={cardStyles.expandPanel}>
          <div style={cardStyles.expandDivider} />

          {/* Description */}
          <div style={cardStyles.expandSection}>
            <div style={cardStyles.expandSectionTitle}>Request Description</div>
            <p style={cardStyles.expandDesc}>{request.description}</p>
          </div>

          {/* Status history track */}
          <div style={cardStyles.expandSection}>
            <div style={cardStyles.expandSectionTitle}>Status Lifecycle</div>
            <StatusTrack history={request.statusHistory} />
          </div>

          {/* Rating (if completed) */}
          {request.rating && (
            <div style={cardStyles.expandSection}>
              <div style={cardStyles.expandSectionTitle}>Client Rating</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: colors.accent.gold, fontSize: 18 }}>
                  {'★'.repeat(request.rating)}{'☆'.repeat(5 - request.rating)}
                </span>
                <span style={{ fontSize: 13, color: colors.neutral[600], marginLeft: 8 }}>
                  {request.rating}/5
                </span>
              </div>
            </div>
          )}

          {/* Client feedback comment (if completed and comment exists) */}
          {request.status === 'completed' && request.commentaire && (
            <div style={cardStyles.expandSection}>
              <div style={cardStyles.expandSectionTitle}>Client Feedback</div>
              <div style={cardStyles.feedbackBox}>
                <span style={cardStyles.feedbackQuote}>"</span>
                <p style={cardStyles.feedbackText}>{request.commentaire}</p>
                <span style={{ ...cardStyles.feedbackQuote, alignSelf: 'flex-end' }}>"</span>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div style={cardStyles.expandSection}>
            <div style={cardStyles.expandSectionTitle}>Timestamps</div>
            <div style={{ fontSize: 12, color: colors.neutral[500] }}>
              Created: {fmtDateTime(request.createdAt)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyles = {
  wrapper: {
    background: colors.neutral[0],
    borderRadius: 14,
    padding: '18px 20px',
    boxShadow: '0 1px 4px #0002',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  idBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  catIcon: {
    fontSize: 22,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.neutral[100],
    borderRadius: 10,
    flexShrink: 0,
  },
  reqId: {
    fontSize: 14,
    fontWeight: 800,
    color: colors.neutral[900],
    display: 'block',
  },
  catLabel: {
    fontSize: 11,
    color: colors.neutral[500],
    fontWeight: 500,
  },
  topRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  dateText: {
    fontSize: 12,
    color: colors.neutral[500],
  },
  expandBtn: {
    padding: '5px 12px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    transition: 'all 0.15s',
  },
  relationRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr 1fr',
    gap: 16,
    alignItems: 'start',
  },
  partyBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  partyLabel: {
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.1em',
    marginBottom: 2,
  },
  partyName: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.neutral[900],
  },
  partyDetail: {
    fontSize: 11,
    color: colors.neutral[500],
  },
  unassigned: {
    fontSize: 12,
    color: colors.neutral[400],
    fontStyle: 'italic',
    marginTop: 4,
  },
  arrowBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 20,
    gap: 0,
  },
  arrowLine: {
    display: 'none',
  },
  arrowHead: {
    fontSize: 20,
    color: colors.neutral[300],
    fontWeight: 300,
  },
  metaBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    borderLeft: `1px solid ${colors.neutral[100]}`,
    paddingLeft: 16,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 12,
    width: 16,
    flexShrink: 0,
  },
  metaText: {
    fontSize: 12,
    color: colors.neutral[600],
  },
  expandPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  expandDivider: {
    height: 1,
    background: colors.neutral[100],
  },
  expandSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  expandSectionTitle: {
    fontSize: 11,
    fontWeight: 800,
    color: colors.neutral[500],
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  expandDesc: {
    fontSize: 13,
    color: colors.neutral[700],
    lineHeight: 1.6,
    margin: 0,
    background: colors.neutral[50],
    borderRadius: 8,
    padding: '10px 14px',
  },
  feedbackBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    background: colors.accent.gold + '0d',
    border: `1px solid ${colors.accent.gold}33`,
    borderRadius: 10,
    padding: '12px 16px',
  },
  feedbackQuote: {
    fontSize: 28,
    lineHeight: 1,
    color: colors.accent.gold,
    opacity: 0.5,
    fontFamily: 'Georgia, serif',
    flexShrink: 0,
    userSelect: 'none',
  },
  feedbackText: {
    fontSize: 13,
    color: colors.neutral[700],
    lineHeight: 1.65,
    margin: 0,
    flex: 1,
    fontStyle: 'italic',
  },
};

// ── Main page ──────────────────────────────────────────────
export default function RequestsPage() {
  const [search,   setSearch]   = useState('');
  const [statusF,  setStatusF]  = useState('all');
  const [categoryF,setCategoryF]= useState('all');
  const [sortBy,   setSortBy]   = useState('newest');
  const [expanded, setExpanded] = useState(null);   // request id
  const [page,     setPage]     = useState(1);

  const toggleExpand = (id) => {
    setExpanded(prev => prev === id ? null : id);
  };

  const q = search.toLowerCase().trim();

  let filtered = MOCK_REQUESTS.filter(r => {
    const matchSearch = !q ||
      r.id.toLowerCase().includes(q) ||
      r.clientName.toLowerCase().includes(q) ||
      r.clientEmail.toLowerCase().includes(q) ||
      (r.providerName && r.providerName.toLowerCase().includes(q)) ||
      (r.providerBusiness && r.providerBusiness.toLowerCase().includes(q));
    const matchStatus   = statusF   === 'all' || r.status === statusF;
    const matchCategory = categoryF === 'all' || r.serviceCategory === categoryF;
    return matchSearch && matchStatus && matchCategory;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'status') return STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status];
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setSearch(''); setStatusF('all'); setCategoryF('all'); setSortBy('newest'); setPage(1);
  };
  const hasFilters = q || statusF !== 'all' || categoryF !== 'all' || sortBy !== 'newest';

  return (
    <div style={pageStyles.container}>

      {/* Page header */}
      <div style={pageStyles.header}>
        <div>
          <h2 style={pageStyles.title}>Requests Management</h2>
          <p style={pageStyles.subtitle}>
            {filtered.length} request{filtered.length !== 1 ? 's' : ''}
            {hasFilters ? ' (filtered)' : ` · ${MOCK_REQUESTS.length} total`}
          </p>
        </div>
        {/* Search */}
        <div style={pageStyles.searchBar}>
          <span style={{ fontSize: 14, color: colors.neutral[400] }}>🔍</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by ID, client, or provider..."
            style={pageStyles.searchInput}
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} style={pageStyles.clearBtn}>✕</button>
          )}
        </div>
      </div>

      {/* Status summary strip */}
      <SummaryStrip requests={MOCK_REQUESTS} />

      {/* Filters row */}
      <div style={pageStyles.filtersRow}>
        <div style={pageStyles.filterGroup}>
          <label style={pageStyles.filterLabel}>Status</label>
          <select value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }} style={pageStyles.select}>
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Statuses' : STATUS_CONFIG[s]?.label || s}
              </option>
            ))}
          </select>
        </div>
        <div style={pageStyles.filterGroup}>
          <label style={pageStyles.filterLabel}>Category</label>
          <select value={categoryF} onChange={e => { setCategoryF(e.target.value); setPage(1); }} style={pageStyles.select}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div style={pageStyles.filterGroup}>
          <label style={pageStyles.filterLabel}>Sort by</label>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }} style={pageStyles.select}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {hasFilters && (
          <button onClick={resetFilters} style={pageStyles.clearFiltersBtn}>Clear filters</button>
        )}
      </div>

      {/* Request list */}
      {paginated.length > 0 ? (
        <div style={pageStyles.list}>
          {paginated.map(req => (
            <RequestCard
              key={req.id}
              request={req}
              expanded={expanded === req.id}
              onToggle={() => toggleExpand(req.id)}
            />
          ))}
        </div>
      ) : (
        <div style={pageStyles.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: colors.neutral[700], marginBottom: 4 }}>
            No requests found
          </div>
          <div style={{ fontSize: 14, color: colors.neutral[400] }}>
            Try adjusting your search or filters
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={pageStyles.pagination}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ ...pageStyles.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
          >
            ← Prev
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                style={{
                  width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14,
                  background: n === page
                    ? `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[500]})`
                    : colors.neutral[100],
                  color:      n === page ? '#fff' : colors.neutral[700],
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
            style={{ ...pageStyles.pageBtn, opacity: page === totalPages ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

const pageStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: colors.neutral[900],
    margin: 0,
  },
  subtitle: {
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
  select: {
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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 24px',
    background: colors.neutral[0],
    borderRadius: 16,
    boxShadow: '0 1px 4px #0002',
  },
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
};
