import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, CreditCard, ScrollText, DollarSign } from 'lucide-react';
import { portalApi } from '../../api';
import { formatCurrency } from '../../utils/currency';
import StatusBadge from '../../components/StatusBadge';

export default function PortalDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    portalApi.getDashboard().then(setSummary);
    portalApi.getInvoices().then(setInvoices);
    portalApi.getBills().then(setBills);
  }, []);

  if (!summary) return <p>Loading...</p>;

  const tiles = [
    { label: 'Outstanding Invoices', value: summary.invoices.pending, icon: FileText, color: 'rgba(96, 165, 250, 0.15)', iconColor: '#60a5fa', link: '/portal/invoices' },
    { label: 'Amount Receivable', value: formatCurrency(summary.invoices.outstanding), icon: DollarSign, color: 'rgba(52, 211, 153, 0.15)', iconColor: '#34d399', link: '/portal/invoices' },
    { label: 'Outstanding Bills', value: summary.bills.pending, icon: ScrollText, color: 'rgba(251, 191, 36, 0.15)', iconColor: '#fbbf24', link: '/portal/bills' },
    { label: 'Amount Payable', value: formatCurrency(summary.bills.outstanding), icon: CreditCard, color: 'rgba(248, 113, 113, 0.15)', iconColor: '#f87171', link: '/portal/bills' },
  ];

  return (
    <>
      <div className="portal-header">
        <h1>Contact Portal</h1>
        <p>View your invoices, bills, and make payments</p>
      </div>

      <div className="kpi-grid">
        {tiles.map(tile => (
          <div key={tile.label} className="kpi-tile" onClick={() => navigate(tile.link)}>
            <div className="kpi-top">
              <div>
                <div className="kpi-label">{tile.label}</div>
                <div className="kpi-value">{tile.value}</div>
              </div>
              <div className="kpi-icon" style={{ background: tile.color }}><tile.icon size={20} style={{ color: tile.iconColor }} /></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="card">
          <div className="card-header"><h3>Recent Invoices</h3><Link to="/portal/invoices" style={{ fontSize: 'var(--text-sm)' }}>View All</Link></div>
          <div className="card-body">
            {invoices.slice(0, 3).map(inv => (
              <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                <div><strong>{inv.invoiceNumber}</strong><div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)' }}>{new Date(inv.invoiceDate).toLocaleDateString()}</div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(inv.totalAmount)}</span>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
            {invoices.length === 0 && <p style={{ color: 'var(--color-muted-foreground)' }}>No invoices yet.</p>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Recent Bills</h3><Link to="/portal/bills" style={{ fontSize: 'var(--text-sm)' }}>View All</Link></div>
          <div className="card-body">
            {bills.slice(0, 3).map(bill => (
              <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                <div><strong>{bill.billNumber}</strong><div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)' }}>{new Date(bill.billDate).toLocaleDateString()}</div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(bill.totalAmount)}</span>
                  <StatusBadge status={bill.status} />
                </div>
              </div>
            ))}
            {bills.length === 0 && <p style={{ color: 'var(--color-muted-foreground)' }}>No bills yet.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
