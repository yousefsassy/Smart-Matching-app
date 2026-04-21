import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { colors } from '../../theme';

export default function AdminLayout({
  admin,
  activePage,
  title,
  sidebarCollapsed,
  onNavigate,
  onLogout,
  onToggleSidebar,
  children,
}) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: colors.neutral[50],
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        collapsed={sidebarCollapsed}
        admin={admin}
        onLogout={onLogout}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar title={title} onToggleSidebar={onToggleSidebar} admin={admin} />
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>{children}</main>
      </div>
    </div>
  );
}
