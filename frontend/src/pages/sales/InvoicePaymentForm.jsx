import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AmountInput from '../../components/AmountInput';
import { paymentsApi, salesApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function InvoicePaymentForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoice_id') || '';
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ amount: 0, method: 'BANK', date: new Date().toISOString().split('T')[0], note: '' });

  useEffect(() => { if (invoiceId) salesApi.getInvoice(invoiceId).then(setInvoice); }, [invoiceId]);

  const amountDue = invoice ? invoice.totalAmount - invoice.amountPaid : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await paymentsApi.payInvoice(invoiceId, {
        amount: parseFloat(form.amount),
        method: form.method,
        date: form.date,
        note: form.note || null,
      });
      navigate('/sales/payments');
    } catch (err) {
      setError(err.message || 'Could not register payment');
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <h1>Register Invoice Payment</h1>
        </div>
      </div>
      <div className="card"><div className="card-body">
        {error && <div className="form-error" role="alert">{error}</div>}
        {invoice && (
          <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-muted-foreground)' }}>
            {invoice.customer?.name} — {invoice.invoiceNumber} — Outstanding: <strong>{formatCurrency(amountDue)}</strong>
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Amount <span className="required">*</span></label><AmountInput value={form.amount} onChange={(v) => setForm(f => ({ ...f, amount: v }))} /></div>
            <div className="form-group"><label className="form-label">Payment Date</label><input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Payment Method</label>
              <select className="form-select" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                <option value="BANK">Bank</option><option value="CASH">Cash</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Note / Memo</label><input className="form-input" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} /></div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Confirm Payment</button>
          </div>
        </form>
      </div></div>
    </>
  );
}
