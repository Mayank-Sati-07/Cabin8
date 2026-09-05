import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { accountingApi } from '../../api';
import { formatCurrency } from '../../utils/currency';
import { useDebitCreditBalance } from '../../hooks/useDebitCreditBalance';

export default function JournalEntryForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [form, setForm] = useState({ entry_number: '', journal_id: '', date: new Date().toISOString().split('T')[0], reference: '', state: 'DRAFT' });
  const { lines, setLines, totals, addLine, updateLine, removeLine } = useDebitCreditBalance([]);

  useEffect(() => {
    Promise.all([accountingApi.getAccounts(), accountingApi.getJournals()]).then(([a, j]) => { setAccounts(a); setJournals(j); });
    if (!isNew) {
      accountingApi.getJournalEntry(id).then(entry => {
        if (entry) {
          setForm({ entry_number: entry.entry_number, journal_id: entry.journal_id, date: entry.date, reference: entry.reference, state: entry.state });
          setLines(entry.items || []);
        }
      });
    }
  }, [id, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, items: lines };
    if (isNew) await accountingApi.createJournalEntry(data);
    else await accountingApi.updateJournalEntry(id, data);
    navigate('/accounting/entries');
  };

  const handlePost = async () => {
    if (!totals.isBalanced) return;
    const data = { ...form, state: 'POSTED', items: lines };
    if (isNew) await accountingApi.createJournalEntry(data);
    else await accountingApi.updateJournalEntry(id, data);
    navigate('/accounting/entries');
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/accounting/entries')}><ArrowLeft size={20} /></button>
          <h1>{isNew ? 'New Journal Entry' : form.entry_number}</h1>
        </div>
      </div>

      {/* Balance Bar */}
      <div className="je-balance-bar">
        <div className="je-balance-item"><span className="je-balance-label">Total Debit:</span><span className="je-balance-value">{formatCurrency(totals.totalDebit)}</span></div>
        <div className="je-balance-item"><span className="je-balance-label">Total Credit:</span><span className="je-balance-value">{formatCurrency(totals.totalCredit)}</span></div>
        <div className={`je-balance-item ${totals.isBalanced ? 'balanced' : 'unbalanced'}`}>
          {totals.isBalanced ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="je-balance-label">Difference:</span>
          <span className="je-balance-value">{formatCurrency(Math.abs(totals.difference))}</span>
        </div>
      </div>

      <div className="card"><div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Journal</label>
              <select className="form-select" value={form.journal_id} onChange={e => setForm(f => ({ ...f, journal_id: e.target.value }))}>
                <option value="">Select journal</option>
                {journals.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Reference</label><input className="form-input" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} /></div>
          </div>

          <h3 style={{ margin: 'var(--space-4) 0 var(--space-3)' }}>Journal Items</h3>
          <div className="data-table-wrapper">
            <table className="line-item-table">
              <thead><tr><th>Account</th><th>Label</th><th style={{ textAlign: 'right' }}>Debit</th><th style={{ textAlign: 'right' }}>Credit</th><th></th></tr></thead>
              <tbody>
                {lines.map(line => (
                  <tr key={line.id}>
                    <td><select value={line.account_id || ''} onChange={e => updateLine(line.id, 'account_id', e.target.value)}>
                      <option value="">Select account</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.account_code} — {a.account_name}</option>)}
                    </select></td>
                    <td><input value={line.label || ''} onChange={e => updateLine(line.id, 'label', e.target.value)} placeholder="Description" /></td>
                    <td><input type="number" min="0" step="0.01" value={line.debit || ''} onChange={e => updateLine(line.id, 'debit', parseFloat(e.target.value) || 0)} style={{ textAlign: 'right' }} /></td>
                    <td><input type="number" min="0" step="0.01" value={line.credit || ''} onChange={e => updateLine(line.id, 'credit', parseFloat(e.target.value) || 0)} style={{ textAlign: 'right' }} /></td>
                    <td><button type="button" className="remove-btn" onClick={() => removeLine(line.id)}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="line-item-add" onClick={() => addLine({ account_id: '', label: '', debit: 0, credit: 0 })}><Plus size={16} /> Add line</button>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/accounting/entries')}>Cancel</button>
            <button type="submit" className="btn btn-secondary">Save Draft</button>
            <button type="button" className="btn btn-primary" disabled={!totals.isBalanced} onClick={handlePost}>
              <Check size={16} /> Post Entry
            </button>
          </div>
        </form>
      </div></div>
    </>
  );
}
