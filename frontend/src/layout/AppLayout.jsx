import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BackgroundVideo from '../components/BackgroundVideo';
import { useAuth } from '../hooks/useAuth';

export default function AppLayout() {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);
  const toggleMobile = () => setMobileOpen(prev => !prev);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      <BackgroundVideo />
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggle={toggleSidebar}
      />
      {mobileOpen && <div className="sidebar-overlay active" onClick={closeMobile} />}
      <div className="app-main">
        <Topbar onMenuClick={toggleMobile} onCollapseClick={toggleSidebar} />
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
