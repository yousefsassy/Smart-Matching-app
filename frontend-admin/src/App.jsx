/**
 * ============================================================
 * ADMIN PANEL APP
 * ============================================================
 * Main app component that handles:
 *  - Authentication state (logged in / logged out)
 *  - Route protection (show login if not authenticated)
 *  - Layout structure (sidebar + topbar + content)
 * 
 * Architecture:
 *  - LoginPage → shown when not authenticated
 *  - AdminLayout → shown when authenticated
 *    - Sidebar (navigation)
 *    - Topbar (header with search/notifications)
 *    - Main content (current page)
 * ============================================================
 */

import { useState } from 'react';
import LoginPage from './LoginPage';
import DashboardPage from './Dashboardpage';
import ClientsPage from './ClientsPage';
import ProvidersPage from './ProvidersPage';
import RequestsPage from './RequestsPage';
import { colors, spacing } from './theme';
import './App.css';

// Navigation items
const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',  icon: '⊞' },
  { id: 'clients',    label: 'Clients',    icon: '👤' },
  { id: 'providers',  label: 'Providers',  icon: '🔧' },
  { id: 'requests',   label: 'Requests',   icon: '📋' },
  { id: 'analytics',  label: 'Analytics',  icon: '📈' },
  { id: 'settings',   label: 'Settings',   icon: '⚙️' },
];

// Sidebar Component
function Sidebar({ activePage, onNavigate, collapsed, admin, onLogout }) {
  return (
    <aside style={{
      width: collapsed ? 64 : 240,
      minHeight: '100vh',
      background: colors.neutral[900],
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
      flexShrink: 0,
      zIndex: 100,
      boxShadow: '4px 0 24px #0003',
    }}>
      
      {/* Logo */}
      <div style={{
        padding: collapsed ? '24px 16px' : '24px',
        borderBottom: `1px solid ${colors.neutral[700]}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        overflow: 'hidden',
      }}>
        <div style={{
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
        }}>
          ✦
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: colors.neutral[0], whiteSpace: 'nowrap' }}>
              SmartMatch
            </div>
            <div style={{ fontSize: 11, color: colors.primary[400], fontWeight: 600, letterSpacing: '0.08em' }}>
              ADMIN PANEL
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(item => {
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
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = colors.neutral[800];
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.neutral[400];
                }
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Profile + Logout */}
      <div style={{
        padding: collapsed ? '16px 8px' : '16px',
        borderTop: `1px solid ${colors.neutral[700]}`,
      }}>
        {!collapsed && admin && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 10,
            background: colors.neutral[800],
            marginBottom: 8,
          }}>
            <div style={{
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
            }}>
              {admin.avatar}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.neutral[0], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
          onMouseEnter={e => e.currentTarget.style.background = '#fee2e233'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: 18 }}>⎋</span>
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}

// Topbar Component
function Topbar({ title, onToggleSidebar, admin }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <header style={{
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
    }}>
      
      {/* Left: Hamburger + Title */}
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
          onMouseEnter={e => e.currentTarget.style.background = colors.neutral[200]}
          onMouseLeave={e => e.currentTarget.style.background = colors.neutral[100]}
        >
          ☰
        </button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: colors.neutral[900] }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: colors.neutral[400] }}>
            {today}
          </div>
        </div>
      </div>

      {/* Right: Search + Notif + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: colors.neutral[100],
          borderRadius: 10,
          padding: '8px 14px',
          minWidth: 200,
        }}>
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

        {/* Notification bell */}
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
            onMouseEnter={e => e.currentTarget.style.background = colors.neutral[200]}
            onMouseLeave={e => e.currentTarget.style.background = colors.neutral[100]}
          >
            🔔
            <span style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: colors.accent.coral,
              border: '2px solid #fff',
            }} />
          </button>
        </div>

        {/* Admin Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
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
          }}>
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

// Main App Component
function App() {
  const [admin, setAdmin] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLoginSuccess = (adminData) => {
    setAdmin(adminData);
  };

  const handleLogout = () => {
    setAdmin(null);
    setActivePage('dashboard');
  };

  const PAGE_TITLES = {
    dashboard:  'Dashboard',
    clients:    'Clients Management',
    providers:  'Service Providers',
    requests:   'Requests Management',
    analytics:  'Analytics',
    settings:   'Settings',
  };

  // Render page based on activePage
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'clients':
        return <ClientsPage />;
      case 'providers':
        return <ProvidersPage />;
      case 'requests':
        return <RequestsPage />;
      case 'analytics':
      case 'settings':
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: 24,
            color: colors.neutral[400],
          }}>
            {PAGE_TITLES[activePage]} - Coming Soon
          </div>
        );
      default:
        return <DashboardPage />;
    }
  };

  // Show login if not authenticated
  if (!admin) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Show admin layout if authenticated
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: colors.neutral[50],
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={sidebarCollapsed}
        admin={admin}
        onLogout={handleLogout}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          title={PAGE_TITLES[activePage]}
          onToggleSidebar={() => setSidebarCollapsed(v => !v)}
          admin={admin}
        />
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;