import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const routeLabels = {
  '': 'Dashboard',
  'contacts': 'Contacts',
  'products': 'Products',
  'categories': 'Categories',
  'purchase': 'Purchase',
  'sales': 'Sales',
  'accounting': 'Accounting',
  'analytics': 'Analytic Accounts',
  'budgets': 'Budgets',
  'reports': 'Reports',
  'portal': 'Portal',
  'orders': 'Orders',
  'bills': 'Vendor Bills',
  'payments': 'Payments',
  'invoices': 'Customer Invoices',
  'chart': 'Chart of Accounts',
  'journals': 'Journals',
  'entries': 'Journal Entries',
  'profit-loss': 'Profit & Loss',
  'balance-sheet': 'Balance Sheet',
  'budget': 'Budget Report',
  'statement': 'Statement',
  'new': 'New',
  'auth': 'Authentication',
  'login': 'Login',
  'signup': 'Sign Up',
  'create-user': 'Create User',
};

export default function Topbar({ onMenuClick, onCollapseClick }) {
  const location = useLocation();
  const { theme, toggleTheme, logout } = useAuth();
  const navigate = useNavigate();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const crumbs = pathParts.map((part, idx) => ({
    label: routeLabels[part] || part,
    path: '/' + pathParts.slice(0, idx + 1).join('/'),
    isLast: idx === pathParts.length - 1,
  }));

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button className="topbar-hamburger" onClick={onMenuClick} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <nav className="topbar-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          {crumbs.map(crumb => (
            <span key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <ChevronRight size={14} className="breadcrumb-sep" />
              {crumb.isLast ? (
                <span className="breadcrumb-active">{crumb.label}</span>
              ) : (
                <Link to={crumb.path}>{crumb.label}</Link>
              )}
            </span>
          ))}
        </nav>
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <Search aria-hidden="true" />
          <input type="text" placeholder="Search anything..." />
        </div>
        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="badge-dot" />
        </button>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button className="topbar-icon-btn" onClick={handleLogout} aria-label="Log out" title="Log out">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
