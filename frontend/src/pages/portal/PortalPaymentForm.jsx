import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AmountInput from '../../components/AmountInput';

export default function PortalPaymentForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ amount: 0, date: new Date().toISOString().split('T')[0], reference: '' });

  const handleSubmit = (e) => { e.preventDefault(); alert('Payment submitted successfully!'); navigate('/portal'); };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
          <h1>Submit Payment</h1>
        </div>
      </div>
      <div className="card"><div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Amount</label><AmountInput value={form.amount} onChange={(v) => setForm(f => ({ ...f, amount: v }))} /></div>
            <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Reference / Memo</label><input className="form-input" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} /></div>
          <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button><button type="submit" className="btn btn-primary">Submit Payment</button></div>
        </form>
      </div></div>
    </>
  );
}
