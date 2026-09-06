import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Package, ShoppingCart, FileText,
  BookOpen, PieChart, Wallet, TrendingUp, Calculator,
  ClipboardList, Receipt, CreditCard, BarChart3, Globe, Tags, UserPlus, Settings
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import { ROLE_LABELS } from '../constants/roles';
import Logo from '../components/Logo';

const MotionNavLink = motion.create(NavLink);

const internalGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Master Data',
    items: [
      { to: '/contacts', icon: Users, label: 'Contacts' },
      { to: '/products', icon: Package, label: 'Products' },
      { to: '/products/categories', icon: Tags, label: 'Product Categories' },
    ],
  },
  {
    label: 'Purchase',
    items: [
      { to: '/purchase/orders', icon: ShoppingCart, label: 'Purchase Orders' },
      { to: '/purchase/bills', icon: FileText, label: 'Vendor Bills' },
      { to: '/purchase/payments', icon: CreditCard, label: 'Bill Payments' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { to: '/sales/orders', icon: ClipboardList, label: 'Sales Orders' },
      { to: '/sales/invoices', icon: Receipt, label: 'Customer Invoices' },
      { to: '/sales/payments', icon: CreditCard, label: 'Invoice Payments' },
    ],
  },
  {
    label: 'Accounting',
    items: [
      { to: '/accounting/chart', icon: BookOpen, label: 'Chart of Accounts' },
      { to: '/accounting/journals', icon: Calculator, label: 'Journals' },
      { to: '/accounting/entries', icon: FileText, label: 'Journal Entries' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/analytics', icon: PieChart, label: 'Analytic Accounts' },
      { to: '/budgets', icon: Wallet, label: 'Budgets' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { to: '/reports/profit-loss', icon: TrendingUp, label: 'Profit & Loss' },
      { to: '/reports/balance-sheet', icon: BarChart3, label: 'Balance Sheet' },
      { to: '/reports/budget', icon: PieChart, label: 'Budget Report' },
    ],
  },
];

const adminGroup = {
  label: 'Administration',
  items: [
    { to: '/auth/create-user', icon: UserPlus, label: 'Create User' },
    { to: '/settings/company', icon: Settings, label: 'Company Settings' },
  ],
};

const portalGroup = {
  label: 'Portal',
  items: [
    { to: '/portal', icon: Globe, label: 'Dashboard' },
    { to: '/portal/invoices', icon: Receipt, label: 'My Invoices' },
    { to: '/portal/bills', icon: FileText, label: 'My Bills' },
    { to: '/portal/statement', icon: BarChart3, label: 'Statement' },
  ],
};

export default function Sidebar({ collapsed, mobileOpen }) {
  const { user } = useAuth();
  const { isAdmin, isPortalUser } = usePermission();

  const groups = isPortalUser
    ? [portalGroup]
    : [...internalGroups, ...(isAdmin ? [adminGroup] : [])];

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <Logo className="logo-icon" size={32} />
        <span>Cabin8</span>
      </div>

      <nav className="sidebar-nav">
        {groups.map(group => (
          <div className="sidebar-group" key={group.label}>
            <div className="sidebar-group-label">{group.label}</div>
            {group.items.map(item => (
              <MotionNavLink
                key={item.to}
                to={item.to}
                end={item.to === '/' || item.to === '/portal'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        className="sidebar-active-pill"
                        layoutId="sidebar-active-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <item.icon size={20} />
                    <span className="sidebar-link-label">{item.label}</span>
                  </>
                )}
              </MotionNavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.name || 'User'}</div>
          <div className="user-role">{ROLE_LABELS[user?.role] || user?.role}</div>
        </div>
      </div>
    </aside>
  );
}
