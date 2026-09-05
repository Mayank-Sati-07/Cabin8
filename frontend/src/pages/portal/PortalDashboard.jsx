import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, CreditCard, ScrollText, DollarSign } from 'lucide-react';
import { salesApi, purchaseApi, contactsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';
import { calculateOrderTotals } from '../../utils/taxCalc';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';

export default function PortalDashboard() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    salesApi.getInvoices().then(setInvoices);
    purchaseApi.getBills().then(setBills);
  }, []);

  const outstandingInvoices = invoices.filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED');
  const outstandingBills = bills.filter(b => b.status !== 'PAID' && b.status !== 'CANCELLED');

  const totalReceivable = outstandingInvoices.reduce((s, i) => s + calculateOrderTotals(i.lines || []).grandTotal, 0);
  const totalPayable = outstandingBills.reduce((s, b) => s + calculateOrderTotals(b.lines || []).grandTotal, 0);

  const tiles = [
    { label: 'Outstanding Invoices', value: outstandingInvoices.length, icon: FileText, color: '#DBEAFE', iconColor: '#1E40AF', link: '/portal/invoices' },
    { label: 'Amount Receivable', value: formatCurrency(totalReceivable), icon: DollarSign, color: '#DCFCE7', iconColor: '#16A34A', link: '/portal/invoices' },
    { label: 'Outstanding Bills', value: outstandingBills.length, icon: ScrollText, color: '#FEF3C7', iconColor: '#D97706', link: '/portal/bills' },
    { label: 'Amount Payable', value: formatCurrency(totalPayable), icon: CreditCard, color: '#FEE2E2', iconColor: '#DC2626', link: '/portal/bills' },
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
                <div><strong>{inv.id}</strong><div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)' }}>{inv.invoice_date}</div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(calculateOrderTotals(inv.lines || []).grandTotal)}</span>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Recent Bills</h3><Link to="/portal/bills" style={{ fontSize: 'var(--text-sm)' }}>View All</Link></div>
          <div className="card-body">
            {bills.slice(0, 3).map(bill => (
              <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>
                <div><strong>{bill.vendor_ref || bill.id}</strong><div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-foreground)' }}>{bill.bill_date}</div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(calculateOrderTotals(bill.lines || []).grandTotal)}</span>
                  <StatusBadge status={bill.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
