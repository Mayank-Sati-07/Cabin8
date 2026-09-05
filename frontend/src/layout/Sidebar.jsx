import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, ShoppingCart, FileText,
  BookOpen, PieChart, Wallet, TrendingUp, Calculator,
  ClipboardList, Receipt, CreditCard, BarChart3, Globe
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../constants/roles';

const navGroups = [
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
  {
    label: 'Portal',
    items: [
      { to: '/portal', icon: Globe, label: 'Contact Portal' },
    ],
  },
];

export default function Sidebar({ collapsed, mobileOpen }) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">UF</div>
        <span>Urban Furniture</span>
      </div>

      <nav className="sidebar-nav">
        {navGroups.map(group => (
          <div className="sidebar-group" key={group.label}>
            <div className="sidebar-group-label">{group.label}</div>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
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
