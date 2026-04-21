import { useState } from 'react';
import { colors } from '../../theme';

export default function Topbar({ title, onToggleSidebar, admin }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: colors.neutral[0],
        borderBottom: `1px solid ${colors.neutral[100]}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 4px #0001',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onToggleSidebar}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 'none',
            background: colors.neutral[100],
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: colors.neutral[700],
            transition: 'background 0.15s',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = colors.neutral[200];
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = colors.neutral[100];
          }}
        >
          ☰
        </button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: colors.neutral[900] }}>{title}</div>
          <div style={{ fontSize: 12, color: colors.neutral[400] }}>{today}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: colors.neutral[100],
            borderRadius: 10,
            padding: '8px 14px',
            minWidth: 200,
          }}
        >
          <span style={{ color: colors.neutral[400], fontSize: 14 }}>🔍</span>
          <input
            placeholder="Search anything..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 14,
              color: colors.neutral[800],
              width: '100%',
            }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: 'none',
              background: colors.neutral[100],
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              transition: 'background 0.15s',
              position: 'relative',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = colors.neutral[200];
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = colors.neutral[100];
            }}
          >
            🔔
            <span
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: colors.accent.coral,
                border: '2px solid #fff',
              }}
            />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            {admin?.avatar || 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: colors.neutral[800] }}>
              {admin?.name || 'Admin'}
            </span>
            <span style={{ fontSize: 11, color: colors.primary[600], fontWeight: 600 }}>
              Super Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
