import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, RefreshCw, X } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { budgetsApi, analyticAccountsApi, contactsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

const today = () => new Date().toISOString().split('T')[0];

export default function BudgetForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [analyticAccounts, setAnalyticAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [budget, setBudget] = useState(null);
  const [error, setError] = useState('');
  const [revising, setRevising] = useState(false);
  const [revision, setRevision] = useState({ startDate: today(), endDate: today(), committedAmount: 0 });
  const [form, setForm] = useState({ name: '', analyticAccountId: '', responsibleId: '', startDate: today(), endDate: today(), committedAmount: 0 });

  useEffect(() => {
    Promise.all([analyticAccountsApi.getAll(), contactsApi.getAll()]).then(([a, c]) => { setAnalyticAccounts(a); setContacts(c); });
    if (!isNew) budgetsApi.getById(id).then(b => b && setBudget(b));
  }, [id, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await budgetsApi.create({
        name: form.name,
        analyticAccountId: parseInt(form.analyticAccountId),
        responsibleId: parseInt(form.responsibleId),
        startDate: form.startDate,
        endDate: form.endDate,
        committedAmount: parseFloat(form.committedAmount) || 0,
      });
      navigate('/budgets');
    } catch (err) {
      setError(err.message || 'Could not create budget');
    }
  };

  const handleConfirm = async () => { try { await budgetsApi.confirm(id); setBudget(await budgetsApi.getById(id)); } catch (err) { setError(err.message); } };
  const handleCancel = async () => { if (!window.confirm('Cancel this budget?')) return; try { await budgetsApi.cancel(id); setBudget(await budgetsApi.getById(id)); } catch (err) { setError(err.message); } };
  const handleRevise = async (e) => {
    e.preventDefault();
    try {
      const revised = await budgetsApi.revise(id, {
        startDate: revision.startDate, endDate: revision.endDate, committedAmount: parseFloat(revision.committedAmount) || 0,
      });
      navigate(`/budgets/${revised.id}`);
    } catch (err) {
      setError(err.message || 'Could not revise budget');
    }
  };

  if (isNew) {
    return (
      <>
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button className="btn btn-ghost btn-icon" onClick={() => navigate('/budgets')}><ArrowLeft size={20} /></button>
            <h1>New Budget</h1>
          </div>
        </div>
        <div className="card"><div className="card-body">
          {error && <div className="form-error" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Budget Name <span className="required">*</span></label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Analytic Account <span className="required">*</span></label>
                <select className="form-select" value={form.analyticAccountId} onChange={e => setForm(f => ({ ...f, analyticAccountId: e.target.value }))} required>
                  <option value="">Select account</option>
                  {analyticAccounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Responsible <span className="required">*</span></label>
                <select className="form-select" value={form.responsibleId} onChange={e => setForm(f => ({ ...f, responsibleId: e.target.value }))} required>
                  <option value="">Select contact</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Committed Amount <span className="required">*</span></label><input type="number" min="0" step="0.01" className="form-input" value={form.committedAmount} onChange={e => setForm(f => ({ ...f, committedAmount: e.target.value }))} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Start Date</label><input type="date" className="form-input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">End Date</label><input type="date" className="form-input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => navigate('/budgets')}>Cancel</button><button type="submit" className="btn btn-primary">Create Budget</button></div>
          </form>
        </div></div>
      </>
    );
  }

  if (!budget) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/budgets')}><ArrowLeft size={20} /></button>
          <h1>{budget.name}</h1>
          <StatusBadge status={budget.status} />
        </div>
        <div className="page-header-actions">
          {budget.status === 'DRAFT' && <button className="btn btn-primary" onClick={handleConfirm}><Check size={16} /> Confirm</button>}
          {budget.status === 'CONFIRMED' && <button className="btn btn-accent" onClick={() => setRevising(v => !v)}><RefreshCw size={16} /> Revise</button>}
          {(budget.status === 'DRAFT' || budget.status === 'CONFIRMED') && <button className="btn btn-destructive" onClick={handleCancel}><X size={16} /> Cancel</button>}
        </div>
      </div>
      {error && <div className="form-error" role="alert">{error}</div>}

      {revising && (
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}><div className="card-body">
          <h3 style={{ marginBottom: 'var(--space-3)' }}>Revise Budget</h3>
          <form onSubmit={handleRevise}>
            <div className="form-row">
              <div className="form-group"><label className="form-label">New Start Date</label><input type="date" className="form-input" value={revision.startDate} onChange={e => setRevision(r => ({ ...r, startDate: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">New End Date</label><input type="date" className="form-input" value={revision.endDate} onChange={e => setRevision(r => ({ ...r, endDate: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">New Committed Amount</label><input type="number" min="0" step="0.01" className="form-input" value={revision.committedAmount} onChange={e => setRevision(r => ({ ...r, committedAmount: e.target.value }))} /></div>
            </div>
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setRevising(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Revision</button></div>
          </form>
        </div></div>
      )}

      <div className="card"><div className="card-body">
        <div className="form-row">
          <div className="form-group"><label className="form-label">Analytic Account</label><input className="form-input" value={budget.analyticAccount?.name || ''} readOnly /></div>
          <div className="form-group"><label className="form-label">Responsible</label><input className="form-input" value={budget.responsible?.name || ''} readOnly /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Period</label><input className="form-input" value={`${new Date(budget.startDate).toLocaleDateString()} → ${new Date(budget.endDate).toLocaleDateString()}`} readOnly /></div>
        </div>

        <div className="line-item-totals">
          <div className="total-row"><span className="total-label">Committed Amount</span><span className="total-value">{formatCurrency(budget.committedAmount)}</span></div>
          <div className="total-row"><span className="total-label">Achieved Amount</span><span className="total-value">{formatCurrency(budget.achievedAmount)}</span></div>
          <div className="total-row"><span className="total-label">Amount To Achieve</span><span className="total-value">{formatCurrency(budget.amountToAchieve)}</span></div>
          <div className="total-row grand"><span className="total-label">Achieved %</span><span className="total-value">{budget.achievedPercent}%</span></div>
        </div>
      </div></div>
    </>
  );
}
