import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AmountInput from '../../components/AmountInput';
import { portalApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function PortalPaymentForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoice_id') || '';
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ amount: 0, method: 'BANK', note: '' });

  useEffect(() => { if (invoiceId) portalApi.getInvoice(invoiceId).then(setInvoice); }, [invoiceId]);

  const amountDue = invoice ? invoice.totalAmount - invoice.amountPaid : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await portalApi.payInvoice(invoiceId, { amount: parseFloat(form.amount), method: form.method, note: form.note || null });
      navigate('/portal/invoices');
    } catch (err) {
      setError(err.message || 'Could not submit payment');
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <h1>Submit Payment</h1>
        </div>
      </div>
      <div className="card"><div className="card-body">
        {error && <div className="form-error" role="alert">{error}</div>}
        {invoice && (
          <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-muted-foreground)' }}>
            {invoice.invoiceNumber} — Outstanding: <strong>{formatCurrency(amountDue)}</strong>
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Amount</label><AmountInput value={form.amount} onChange={(v) => setForm(f => ({ ...f, amount: v }))} /></div>
            <div className="form-group"><label className="form-label">Method</label>
              <select className="form-select" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                <option value="BANK">Bank</option><option value="CASH">Cash</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Note / Memo</label><input className="form-input" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} /></div>
          <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button><button type="submit" className="btn btn-primary">Submit Payment</button></div>
        </form>
      </div></div>
    </>
  );
}
