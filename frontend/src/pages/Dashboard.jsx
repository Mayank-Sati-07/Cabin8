import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard,
  FileText, ShoppingCart, Users, Package, ArrowUpRight, ClipboardList
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '../utils/currency';
import { dashboardApi } from '../api';
import StatusBadge from '../components/StatusBadge';
import PageLoader from '../components/PageLoader';

const PIE_COLORS = ['#38bdf8', '#2dd4bf', '#818cf8', '#60a5fa'];

const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const blobY1 = useTransform(scrollY, [0, 900], [0, 220]);
  const blobY2 = useTransform(scrollY, [0, 900], [0, -180]);

  useEffect(() => { dashboardApi.get().then(setData); }, []);

  if (!data) return <PageLoader />;

  const { tiles, amounts, recentActivity } = data;

  const kpis = [
    { label: 'Total Invoiced', value: formatCurrency(amounts.totalInvoiced), icon: DollarSign, color: 'rgba(52, 211, 153, 0.15)', iconColor: '#34d399', onClick: () => navigate('/sales/invoices') },
    { label: 'Outstanding Receivables', value: formatCurrency(amounts.totalInvoiced - amounts.totalReceived), icon: TrendingUp, color: 'rgba(96, 165, 250, 0.15)', iconColor: '#60a5fa', onClick: () => navigate('/sales/invoices') },
    { label: 'Outstanding Payables', value: formatCurrency(amounts.totalBilled - amounts.totalPaid), icon: CreditCard, color: 'rgba(251, 191, 36, 0.15)', iconColor: '#fbbf24', onClick: () => navigate('/purchase/bills') },
    { label: 'Total Received', value: formatCurrency(amounts.totalReceived), icon: TrendingDown, color: 'rgba(52, 211, 153, 0.15)', iconColor: '#34d399', onClick: () => navigate('/sales/payments') },
    { label: 'Budget Committed', value: formatCurrency(amounts.budgetCommitted), icon: DollarSign, color: 'rgba(129, 140, 248, 0.15)', iconColor: '#818cf8', onClick: () => navigate('/budgets') },
  ];

  const quickActions = [
    { label: 'New Sales Order', icon: ClipboardList, to: '/sales/orders/new' },
    { label: 'New Purchase Order', icon: ShoppingCart, to: '/purchase/orders/new' },
    { label: 'Add Product', icon: Package, to: '/products/new' },
    { label: 'Add Contact', icon: Users, to: '/contacts/new' },
  ];

  const amountsChartData = [
    { name: 'Invoiced', value: amounts.totalInvoiced },
    { name: 'Received', value: amounts.totalReceived },
    { name: 'Billed', value: amounts.totalBilled },
    { name: 'Paid', value: amounts.totalPaid },
  ];

  const orderMix = [
    { name: 'Sales Orders', value: tiles.sales.all },
    { name: 'Purchase Orders', value: tiles.purchases.all },
    { name: 'Confirmed Sales', value: tiles.sales.confirmed },
    { name: 'Confirmed Purchases', value: tiles.purchases.confirmed },
  ].filter(d => d.value > 0);

  const feed = [
    ...recentActivity.invoices.map(i => ({ id: `inv-${i.id}`, text: `Invoice ${i.number} — ${i.customer}`, amount: i.amount, date: i.date, status: i.status })),
    ...recentActivity.bills.map(b => ({ id: `bill-${b.id}`, text: `Bill ${b.number} — ${b.vendor}`, amount: b.amount, date: b.date, status: b.status })),
    ...recentActivity.payments.map(p => ({ id: `pay-${p.id}`, text: `${p.type === 'RECEIVE' ? 'Received from' : 'Paid to'} ${p.partner}`, amount: p.amount, date: p.date, status: p.type })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  return (
    <div className="dashboard-parallax-wrap">
      {!shouldReduceMotion && (
        <>
          <motion.div className="parallax-blob blob-a" style={{ y: blobY1 }} aria-hidden="true" />
          <motion.div className="parallax-blob blob-b" style={{ y: blobY2 }} aria-hidden="true" />
        </>
      )}

      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p className="page-subtitle">Welcome back! Here's your business overview.</p>
          </div>
        </div>

        {/* KPI Tiles */}
        <motion.div
          className="kpi-grid"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {kpis.map(kpi => (
            <motion.div
              key={kpi.label}
              className="kpi-tile"
              variants={itemVariants}
              onClick={kpi.onClick}
              whileHover={{ y: -4, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="kpi-top">
                <div>
                  <div className="kpi-label">
                    {kpi.label}
                    <ArrowUpRight size={14} />
                  </div>
                  <div className="kpi-value">{kpi.value}</div>
                </div>
                <div className="kpi-icon" style={{ background: kpi.color }}>
                  <kpi.icon size={20} style={{ color: kpi.iconColor }} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="quick-actions"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {quickActions.map(action => (
            <motion.button
              key={action.label}
              className="quick-action-btn"
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(action.to)}
            >
              <action.icon size={18} />
              {action.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Charts Row */}
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <motion.div className="card" variants={itemVariants}>
            <div className="card-header"><h3>Invoiced / Received / Billed / Paid</h3></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={amountsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)' }} />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div className="card" variants={itemVariants}>
            <div className="card-header"><h3>Order Mix</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {orderMix.length === 0 ? <p style={{ color: 'var(--color-muted-foreground)' }}>No orders yet.</p> : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={orderMix} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                        {orderMix.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
                    {orderMix.map((item, i) => (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)' }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {item.name} ({item.value})
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="card"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="card-header"><h3>Recent Activity</h3></div>
          <div className="card-body">
            {feed.length === 0 && <p style={{ color: 'var(--color-muted-foreground)' }}>No activity yet.</p>}
            <motion.ul className="activity-feed" variants={sectionVariants}>
              {feed.map(item => (
                <motion.li key={item.id} className="activity-item" variants={itemVariants} whileHover={{ x: 4 }}>
                  <div className="activity-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                    <FileText size={16} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      {item.text}
                      {item.amount != null && <strong> — {formatCurrency(item.amount)}</strong>}
                    </div>
                    <div className="activity-time">{new Date(item.date).toLocaleDateString()}</div>
                  </div>
                  <StatusBadge status={item.status} />
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
