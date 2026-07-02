import { NAV_ITEMS } from '../../data/appShellData';
import { colors } from '../../theme';

export default function Sidebar({
  activePage,
  onNavigate,
  collapsed,
  admin,
  onLogout,
}) {
  return (
    <aside
      style={{
        width: collapsed ? 64 : 240,
        minHeight: '100vh',
        background: colors.neutral[900],
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
        flexShrink: 0,
        zIndex: 100,
        boxShadow: '4px 0 24px #0003',
      }}
    >
      <div
        style={{
          padding: collapsed ? '24px 16px' : '24px',
          borderBottom: `1px solid ${colors.neutral[700]}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            flexShrink: 0,
            background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.accent.cyan})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            boxShadow: `0 4px 12px ${colors.primary[500]}66`,
          }}
        >
          ✦
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: colors.neutral[0],
                whiteSpace: 'nowrap',
              }}
            >
              SmartMatch
            </div>
            <div
              style={{
                fontSize: 11,
                color: colors.primary[400],
                fontWeight: 600,
                letterSpacing: '0.08em',
              }}
            >
              ADMIN PANEL
            </div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 12,
                padding: collapsed ? '10px 0' : '10px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: isActive
                  ? `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[500]})`
                  : 'transparent',
                color: isActive ? '#fff' : colors.neutral[400],
                fontSize: 14,
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.15s',
                boxShadow: isActive ? `0 4px 12px ${colors.primary[600]}44` : 'none',
                width: '100%',
                overflow: 'hidden',
              }}
              onMouseEnter={(event) => {
                if (!isActive) {
                  event.currentTarget.style.background = colors.neutral[800];
                  event.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(event) => {
                if (!isActive) {
                  event.currentTarget.style.background = 'transparent';
                  event.currentTarget.style.color = colors.neutral[400];
                }
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div
        style={{
          padding: collapsed ? '16px 8px' : '16px',
          borderTop: `1px solid ${colors.neutral[700]}`,
        }}
      >
        {!collapsed && admin && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 10,
              background: colors.neutral[800],
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.accent.purple}, ${colors.primary[500]})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {admin.avatar}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: colors.neutral[0],
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {admin.name}
              </div>
              <div style={{ fontSize: 11, color: colors.primary[400], fontWeight: 600 }}>
                Super Admin
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
            padding: collapsed ? '10px 0' : '10px 14px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            background: 'transparent',
            color: colors.accent.coral,
            fontSize: 14,
            fontWeight: 600,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = '#fee2e233';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = 'transparent';
          }}
        >
          <span style={{ fontSize: 18 }}>⎋</span>
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
