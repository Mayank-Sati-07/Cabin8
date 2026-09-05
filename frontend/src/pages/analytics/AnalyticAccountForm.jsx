import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { budgetApi } from '../../api';

export default function AnalyticAccountForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', code: '', type: 'BOTH', description: '' });

  useEffect(() => { if (!isNew) { budgetApi.getAnalyticAccounts().then(accts => { const a = accts.find(x => x.id === id); if (a) setForm(a); }); } }, [id, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNew) await budgetApi.createAnalyticAccount(form);
    else await budgetApi.updateAnalyticAccount(id, form);
    navigate('/analytics');
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/analytics')}><ArrowLeft size={20} /></button>
          <h1>{isNew ? 'New Analytic Account' : `Edit: ${form.name}`}</h1>
        </div>
      </div>
      <div className="card"><div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Name <span className="required">*</span></label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">Code <span className="required">*</span></label><input className="form-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="INCOME">Income</option><option value="EXPENSE">Expense</option><option value="BOTH">Both</option></select>
            </div>
            <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => navigate('/analytics')}>Cancel</button><button type="submit" className="btn btn-primary">{isNew ? 'Create' : 'Save'}</button></div>
        </form>
      </div></div>
    </>
  );
}
