import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard,
  FileText, ShoppingCart, Plus, Users, Package, ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '../utils/currency';
import { contactsApi, productsApi, salesApi, purchaseApi, reportsApi } from '../api';
import StatusBadge from '../components/StatusBadge';

const revenueData = [
  { month: 'Jan', revenue: 42000, expenses: 28000 },
  { month: 'Feb', revenue: 38000, expenses: 24000 },
  { month: 'Mar', revenue: 55000, expenses: 32000 },
  { month: 'Apr', revenue: 48000, expenses: 29000 },
  { month: 'May', revenue: 62000, expenses: 35000 },
  { month: 'Jun', revenue: 58000, expenses: 31000 },
];

const expenseBreakdown = [
  { name: 'Raw Materials', value: 45 },
  { name: 'Operations', value: 25 },
  { name: 'Marketing', value: 15 },
  { name: 'Logistics', value: 15 },
];

const PIE_COLORS = ['#1E40AF', '#3B82F6', '#D97706', '#60A5FA'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ contacts: 0, products: 0, receivables: 0, payables: 0, revenue: 0, netProfit: 0 });
  const [recentActivity] = useState([
    { id: 1, type: 'invoice', text: 'Invoice #INV/2026/0001 paid by Nimesh Pathak', amount: 708, time: '2 hours ago', status: 'PAID' },
    { id: 2, type: 'bill', text: 'Vendor Bill #AZ-INV-001 paid to Azure Furniture', amount: 826, time: '5 hours ago', status: 'PAID' },
    { id: 3, type: 'order', text: 'Sales Order #SO-002 confirmed for Priya Sharma', amount: 2950, time: '1 day ago', status: 'CONFIRMED' },
    { id: 4, type: 'purchase', text: 'Purchase Order #PO-002 from WoodCraft Industries', amount: 2990, time: '2 days ago', status: 'CONFIRMED' },
    { id: 5, type: 'contact', text: 'New contact Rajesh Kumar added', amount: null, time: '3 days ago', status: 'DRAFT' },
  ]);

  useEffect(() => {
    async function loadData() {
      const [contacts, products, pnl] = await Promise.all([
        contactsApi.getAll(), productsApi.getAll(), reportsApi.getProfitAndLoss(),
      ]);
      setData({
        contacts: contacts.length,
        products: products.length,
        receivables: 12500,
        payables: 8400,
        revenue: pnl.totalIncome || 600,
        netProfit: pnl.netProfit || -100,
      });
    }
    loadData();
  }, []);

  const kpis = [
    { label: 'Total Revenue', value: formatCurrency(data.revenue), change: '+12.5%', positive: true, icon: DollarSign, color: '#DCFCE7', iconColor: '#16A34A', onClick: () => navigate('/reports/profit-loss') },
    { label: 'Outstanding Receivables', value: formatCurrency(data.receivables), change: '-4.2%', positive: true, icon: TrendingUp, color: '#DBEAFE', iconColor: '#1E40AF', onClick: () => navigate('/sales/invoices') },
    { label: 'Outstanding Payables', value: formatCurrency(data.payables), change: '+2.1%', positive: false, icon: CreditCard, color: '#FEF3C7', iconColor: '#D97706', onClick: () => navigate('/purchase/bills') },
    { label: 'Net Profit', value: formatCurrency(data.netProfit), change: data.netProfit >= 0 ? '+8.3%' : '-2.1%', positive: data.netProfit >= 0, icon: TrendingDown, color: data.netProfit >= 0 ? '#DCFCE7' : '#FEE2E2', iconColor: data.netProfit >= 0 ? '#16A34A' : '#DC2626', onClick: () => navigate('/reports/profit-loss') },
    { label: 'Cash & Bank', value: formatCurrency(25600), change: '+5.7%', positive: true, icon: DollarSign, color: '#EDE9FE', iconColor: '#8B5CF6', onClick: () => navigate('/accounting/chart') },
  ];

  const quickActions = [
    { label: 'New Sales Order', icon: ClipboardList, to: '/sales/orders/new' },
    { label: 'New Purchase Order', icon: ShoppingCart, to: '/purchase/orders/new' },
    { label: 'Add Product', icon: Package, to: '/products/new' },
    { label: 'Add Contact', icon: Users, to: '/contacts/new' },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your business overview.</p>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="kpi-grid">
        {kpis.map(kpi => (
          <div key={kpi.label} className="kpi-tile" onClick={kpi.onClick}>
            <div className="kpi-top">
              <div>
                <div className="kpi-label">
                  {kpi.label}
                  <ArrowUpRight size={14} />
                </div>
                <div className="kpi-value">{kpi.value}</div>
                <div className={`kpi-change ${kpi.positive ? 'positive' : 'negative'}`}>
                  {kpi.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.change} vs last month
                </div>
              </div>
              <div className="kpi-icon" style={{ background: kpi.color }}>
                <kpi.icon size={20} style={{ color: kpi.iconColor }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {quickActions.map(action => (
          <button key={action.label} className="quick-action-btn" onClick={() => navigate(action.to)}>
            <action.icon size={18} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="card">
          <div className="card-header"><h3>Revenue vs Expenses</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1E40AF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#1E40AF" fill="url(#colorRevenue)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#D97706" fill="url(#colorExpenses)" strokeWidth={2} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Expense Breakdown</h3></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {expenseBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
              {expenseBreakdown.map((item, i) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[i] }} />
                  {item.name} ({item.value}%)
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header"><h3>Recent Activity</h3></div>
        <div className="card-body">
          <ul className="activity-feed">
            {recentActivity.map(item => (
              <li key={item.id} className="activity-item">
                <div className="activity-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  <FileText size={16} />
                </div>
                <div className="activity-content">
                  <div className="activity-text">
                    {item.text}
                    {item.amount && <strong> — {formatCurrency(item.amount)}</strong>}
                  </div>
                  <div className="activity-time">{item.time}</div>
                </div>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

// Fix missing import
import { ClipboardList } from 'lucide-react';
