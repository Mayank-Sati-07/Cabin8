import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, X } from 'lucide-react';
import LineItemEditor from '../../components/LineItemEditor';
import StatusBadge from '../../components/StatusBadge';
import { purchaseApi } from '../../api';
import { formatCurrency } from '../../utils/currency';
import { usePermission } from '../../hooks/usePermission';

export default function VendorBillForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');
  const { isAdmin } = usePermission();

  const load = () => purchaseApi.getBill(id).then(setBill);
  useEffect(() => { load(); }, [id]);

  if (!bill) return <div className="page-container"><p>Loading...</p></div>;

  const handleConfirm = async () => {
    try { await purchaseApi.confirmBill(id); load(); } catch (err) { setError(err.message || 'Could not confirm bill'); }
  };
  const handleCancel = async () => {
    if (!window.confirm('Cancel this bill?')) return;
    try { await purchaseApi.cancelBill(id); load(); } catch (err) { setError(err.message || 'Could not cancel bill'); }
  };
  const handlePayment = () => navigate(`/purchase/payments/new?bill_id=${id}`);

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/purchase/bills')}><ArrowLeft size={20} /></button>
          <h1>Vendor Bill: {bill.vendorBillNo || bill.billNumber}</h1>
          <StatusBadge status={bill.status} />
        </div>
        <div className="page-header-actions">
          {bill.status === 'DRAFT' && <button className="btn btn-primary" onClick={handleConfirm}><Check size={16} /> Confirm</button>}
          {(bill.status === 'CONFIRMED') && <button className="btn btn-accent" onClick={handlePayment}><CreditCard size={16} /> Register Payment</button>}
          {isAdmin && bill.status !== 'PAID' && bill.status !== 'CANCELLED' && <button className="btn btn-destructive" onClick={handleCancel}><X size={16} /> Cancel</button>}
        </div>
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="card"><div className="card-body">
        <div className="form-row">
          <div className="form-group"><label className="form-label">Vendor</label><input className="form-input" value={bill.vendor?.name || ''} readOnly /></div>
          <div className="form-group"><label className="form-label">Bill Date</label><input className="form-input" value={new Date(bill.billDate).toLocaleDateString()} readOnly /></div>
          <div className="form-group"><label className="form-label">Due Date</label><input className="form-input" value={bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : '—'} readOnly /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Subtotal</label><input className="form-input" value={formatCurrency(bill.subTotal)} readOnly /></div>
          <div className="form-group"><label className="form-label">Tax (GST)</label><input className="form-input" value={formatCurrency(bill.taxAmount)} readOnly /></div>
          <div className="form-group"><label className="form-label">Total Amount</label><input className="form-input" value={formatCurrency(bill.totalAmount)} readOnly /></div>
          <div className="form-group"><label className="form-label">Amount Paid</label><input className="form-input" value={formatCurrency(bill.amountPaid)} readOnly /></div>
        </div>
        <h3 style={{ margin: 'var(--space-5) 0 var(--space-3)' }}>Bill Lines</h3>
        <LineItemEditor
          lines={bill.lines || []}
          onChange={() => {}}
          readOnly
          taxSummary={{ subTotal: bill.subTotal, cgstAmount: bill.cgstAmount, sgstAmount: bill.sgstAmount, igstAmount: bill.igstAmount, totalAmount: bill.totalAmount }}
        />
      </div></div>
    </>
  );
}
