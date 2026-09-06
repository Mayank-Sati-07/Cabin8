import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, PanelLeftClose, PanelLeftOpen, Search, Bell, Sun, Moon, ChevronRight, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { searchApi, notificationsApi } from '../api';

const dropdownMotion = {
  initial: { opacity: 0, y: -8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
  transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
};

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

const READ_KEY = 'uf_notif_read';
const NOTIF_POLL_MS = 60000;
const SEARCH_DEBOUNCE_MS = 300;

function loadReadIds() {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(set) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore storage failures (private browsing, quota, etc.)
  }
}

export default function Topbar({ onMenuClick, onCollapseClick, collapsed }) {
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

  // ---- Search ----
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchWrapRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearching(false);
      return undefined;
    }
    setSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchApi.search(trimmed)
        .then(data => setResults(data?.results || []))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleResultClick = (route) => {
    navigate(route);
    setSearchOpen(false);
    setQuery('');
    setResults([]);
  };

  // ---- Notifications ----
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState(loadReadIds);
  const notifWrapRef = useRef(null);

  const fetchNotifications = useCallback(() => {
    notificationsApi.getAll()
      .then(data => setNotifications(data?.notifications || []))
      .catch(() => { /* keep last known list on transient failure */ });
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, NOTIF_POLL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const markRead = (ids) => {
    setReadIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      saveReadIds(next);
      return next;
    });
  };

  const handleNotifClick = (notif) => {
    markRead([notif.id]);
    setNotifOpen(false);
    navigate(notif.route);
  };

  const markAllRead = () => {
    markRead(notifications.map(n => n.id));
  };

  // ---- Close dropdowns on outside click / Escape ----
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setSearchOpen(false);
      if (notifWrapRef.current && !notifWrapRef.current.contains(e.target)) setNotifOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button className="topbar-hamburger" onClick={onMenuClick} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <button
          className="topbar-collapse-btn"
          onClick={onCollapseClick}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
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
        <div className="topbar-search" ref={searchWrapRef}>
          <Search aria-hidden="true" />
          <input
            type="text"
            placeholder="Search anything..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => { if (query.trim()) setSearchOpen(true); }}
          />
          <AnimatePresence>
            {searchOpen && query.trim() && (
              <motion.div className="topbar-dropdown search-dropdown" {...dropdownMotion}>
                {searching ? (
                  <div className="topbar-dropdown-empty">
                    <Loader2 size={14} className="spin" /> Searching...
                  </div>
                ) : results.length === 0 ? (
                  <div className="topbar-dropdown-empty">No results for &quot;{query.trim()}&quot;</div>
                ) : (
                  <ul className="topbar-dropdown-list">
                    {results.map((r) => (
                      <li key={`${r.type}-${r.id}`}>
                        <button type="button" className="search-result-item" onClick={() => handleResultClick(r.route)}>
                          <span className="search-result-type">{r.type}</span>
                          <span className="search-result-body">
                            <span className="search-result-title">{r.title}</span>
                            {r.subtitle && <span className="search-result-subtitle">{r.subtitle}</span>}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="topbar-notif" ref={notifWrapRef}>
          <button
            className="topbar-icon-btn"
            aria-label="Notifications"
            onClick={() => setNotifOpen(prev => !prev)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div className="topbar-dropdown notif-dropdown" {...dropdownMotion}>
                <div className="topbar-dropdown-header">
                  <span>Notifications</span>
                  {notifications.length > 0 && (
                    <button type="button" className="notif-mark-all" onClick={markAllRead}>Mark all read</button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="topbar-dropdown-empty">You&apos;re all caught up</div>
                ) : (
                  <ul className="topbar-dropdown-list">
                    {notifications.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          className={`notif-item notif-${n.severity}${readIds.has(n.id) ? '' : ' unread'}`}
                          onClick={() => handleNotifClick(n)}
                        >
                          <span className="notif-severity-dot" />
                          <span className="notif-body">
                            <span className="notif-title">{n.title}</span>
                            <span className="notif-message">{n.message}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
