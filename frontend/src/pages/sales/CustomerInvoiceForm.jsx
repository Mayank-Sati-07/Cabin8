import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, X } from 'lucide-react';
import LineItemEditor from '../../components/LineItemEditor';
import StatusBadge from '../../components/StatusBadge';
import { salesApi } from '../../api';
import { formatCurrency } from '../../utils/currency';
import { usePermission } from '../../hooks/usePermission';

export default function CustomerInvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const { isAdmin } = usePermission();

  const load = () => salesApi.getInvoice(id).then(setInvoice);
  useEffect(() => { load(); }, [id]);

  if (!invoice) return <div className="page-container"><p>Loading...</p></div>;

  const handleConfirm = async () => {
    try { await salesApi.confirmInvoice(id); load(); } catch (err) { setError(err.message || 'Could not confirm invoice'); }
  };
  const handleCancel = async () => {
    if (!window.confirm('Cancel this invoice?')) return;
    try { await salesApi.cancelInvoice(id); load(); } catch (err) { setError(err.message || 'Could not cancel invoice'); }
  };
  const handlePayment = () => navigate(`/sales/payments/new?invoice_id=${id}`);

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/sales/invoices')}><ArrowLeft size={20} /></button>
          <h1>Invoice: {invoice.invoiceNumber}</h1><StatusBadge status={invoice.status} />
        </div>
        <div className="page-header-actions">
          {invoice.status === 'DRAFT' && <button className="btn btn-primary" onClick={handleConfirm}><Check size={16} /> Confirm</button>}
          {invoice.status === 'CONFIRMED' && <button className="btn btn-accent" onClick={handlePayment}><CreditCard size={16} /> Register Payment</button>}
          {isAdmin && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && <button className="btn btn-destructive" onClick={handleCancel}><X size={16} /> Cancel</button>}
        </div>
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="card"><div className="card-body">
        <div className="form-row">
          <div className="form-group"><label className="form-label">Customer</label><input className="form-input" value={invoice.customer?.name || ''} readOnly /></div>
          <div className="form-group"><label className="form-label">Invoice Date</label><input className="form-input" value={new Date(invoice.invoiceDate).toLocaleDateString()} readOnly /></div>
          <div className="form-group"><label className="form-label">Due Date</label><input className="form-input" value={invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'} readOnly /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Subtotal</label><input className="form-input" value={formatCurrency(invoice.subTotal)} readOnly /></div>
          <div className="form-group"><label className="form-label">Tax (GST)</label><input className="form-input" value={formatCurrency(invoice.taxAmount)} readOnly /></div>
          <div className="form-group"><label className="form-label">Total Amount</label><input className="form-input" value={formatCurrency(invoice.totalAmount)} readOnly /></div>
          <div className="form-group"><label className="form-label">Amount Paid</label><input className="form-input" value={formatCurrency(invoice.amountPaid)} readOnly /></div>
        </div>
        <h3 style={{ margin: 'var(--space-5) 0 var(--space-3)' }}>Invoice Lines</h3>
        <LineItemEditor
          lines={invoice.lines || []}
          onChange={() => {}}
          readOnly
          taxSummary={{ subTotal: invoice.subTotal, cgstAmount: invoice.cgstAmount, sgstAmount: invoice.sgstAmount, igstAmount: invoice.igstAmount, totalAmount: invoice.totalAmount }}
        />
      </div></div>
    </>
  );
}
