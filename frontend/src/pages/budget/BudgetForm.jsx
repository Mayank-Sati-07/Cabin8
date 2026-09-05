import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, RefreshCw, X, Plus, Trash2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { budgetApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function BudgetForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [analyticAccounts, setAnalyticAccounts] = useState([]);
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '', period: 'Monthly', responsible: 'Admin User', status: 'DRAFT', lines: [] });

  useEffect(() => {
    budgetApi.getAnalyticAccounts().then(setAnalyticAccounts);
    if (!isNew) budgetApi.getBudget(id).then(b => b && setForm(b));
  }, [id, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNew) await budgetApi.createBudget(form);
    else await budgetApi.updateBudget(id, form);
    navigate('/budgets');
  };

  const handleStatus = async (status) => { await budgetApi.updateBudget(id, { status }); navigate('/budgets'); };

  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, { id: Date.now().toString(), analytic_account_id: '', planned_amount: 0 }] }));
  const updateLine = (idx, field, value) => setForm(f => ({ ...f, lines: f.lines.map((l, i) => i === idx ? { ...l, [field]: value } : l) }));
  const removeLine = (idx) => setForm(f => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/budgets')}><ArrowLeft size={20} /></button>
          <h1>{isNew ? 'New Budget' : form.name}</h1>
          {!isNew && <StatusBadge status={form.status} />}
        </div>
        {!isNew && (
          <div className="page-header-actions">
            {form.status === 'DRAFT' && <button className="btn btn-primary" onClick={() => handleStatus('CONFIRMED')}><Check size={16} /> Confirm</button>}
            {form.status === 'CONFIRMED' && <button className="btn btn-accent" onClick={() => handleStatus('REVISED')}><RefreshCw size={16} /> Revise</button>}
            {form.status !== 'CANCELLED' && <button className="btn btn-destructive" onClick={() => handleStatus('CANCELLED')}><X size={16} /> Cancel</button>}
          </div>
        )}
      </div>
      <div className="card"><div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Budget Name <span className="required">*</span></label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">Period</label>
              <select className="form-select" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}><option>Monthly</option><option>Quarterly</option><option>Annual</option></select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Start Date</label><input type="date" className="form-input" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">End Date</label><input type="date" className="form-input" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
          </div>

          <h3 style={{ margin: 'var(--space-5) 0 var(--space-3)' }}>Budget Lines</h3>
          <div className="data-table-wrapper">
            <table className="line-item-table">
              <thead><tr><th>Analytic Account</th><th style={{ textAlign: 'right' }}>Planned Amount</th><th></th></tr></thead>
              <tbody>
                {form.lines.map((line, idx) => (
                  <tr key={line.id || idx}>
                    <td><select value={line.analytic_account_id} onChange={e => updateLine(idx, 'analytic_account_id', e.target.value)}>
                      <option value="">Select account</option>{analyticAccounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                    </select></td>
                    <td><input type="number" min="0" step="0.01" value={line.planned_amount} onChange={e => updateLine(idx, 'planned_amount', parseFloat(e.target.value) || 0)} style={{ textAlign: 'right' }} /></td>
                    <td><button type="button" className="remove-btn" onClick={() => removeLine(idx)}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="line-item-add" onClick={addLine}><Plus size={16} /> Add line</button>

          <div className="line-item-totals">
            <div className="total-row grand"><span className="total-label">Total Planned</span><span className="total-value">{formatCurrency(form.lines.reduce((s, l) => s + (l.planned_amount || 0), 0))}</span></div>
          </div>

          <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => navigate('/budgets')}>Cancel</button><button type="submit" className="btn btn-primary">{isNew ? 'Create Budget' : 'Save'}</button></div>
        </form>
      </div></div>
    </>
  );
}
