import { useState } from 'react';
import LoginPage from './LoginPage';
import DashboardPage from './Dashboardpage';
import ClientsPage from './ClientsPage';
import ProvidersPage from './ProvidersPage';
import RequestsPage from './RequestsPage';
import AdminLayout from './components/layout/AdminLayout';
import { PAGE_TITLES } from './data/appShellData';
import { getStoredAdmin, logoutAdmin } from './services';
import { colors } from './theme';
import './App.css';

function renderPage(activePage) {
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: 24,
            color: colors.neutral[400],
          }}
        >
          {PAGE_TITLES[activePage]} - Coming Soon
        </div>
      );
    default:
      return <DashboardPage />;
  }
}

export default function App() {
  const [admin, setAdmin] = useState(() => getStoredAdmin());
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!admin) {
    return <LoginPage onLoginSuccess={setAdmin} />;
  }

  return (
    <AdminLayout
      admin={admin}
      activePage={activePage}
      title={PAGE_TITLES[activePage]}
      sidebarCollapsed={sidebarCollapsed}
      onNavigate={setActivePage}
      onLogout={() => {
        logoutAdmin();
        setAdmin(null);
        setActivePage('dashboard');
      }}
      onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
    >
      {renderPage(activePage)}
    </AdminLayout>
  );
}
