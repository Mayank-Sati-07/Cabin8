import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AmountInput from '../../components/AmountInput';
import { paymentsApi } from '../../api';

export default function InvoicePaymentForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoice_id') || '';
  const [form, setForm] = useState({ amount: 0, date: new Date().toISOString().split('T')[0], journal_id: 'j4', reference: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await paymentsApi.create({ ...form, payment_type: 'INBOUND', partner_id: '', invoice_id: invoiceId });
    navigate('/sales/payments');
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
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Amount <span className="required">*</span></label><AmountInput value={form.amount} onChange={(v) => setForm(f => ({ ...f, amount: v }))} /></div>
            <div className="form-group"><label className="form-label">Payment Date</label><input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Payment Method</label>
              <select className="form-select" value={form.journal_id} onChange={e => setForm(f => ({ ...f, journal_id: e.target.value }))}>
                <option value="j3">Bank</option><option value="j4">Cash</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Reference / Memo</label><input className="form-input" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} /></div>
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
