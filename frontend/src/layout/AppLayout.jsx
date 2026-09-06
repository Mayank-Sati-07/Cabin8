import { useState } from 'react';
import { Navigate, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BackgroundVideo from '../components/BackgroundVideo';
import { useAuth } from '../hooks/useAuth';

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function AppLayout() {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const outlet = useOutlet();

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
        <Topbar onMenuClick={toggleMobile} onCollapseClick={toggleSidebar} collapsed={sidebarCollapsed} />
        <div className="page-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
