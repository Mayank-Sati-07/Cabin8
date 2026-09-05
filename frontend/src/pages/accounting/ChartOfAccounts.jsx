import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from '../../components/DataTable';
import { accountingApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newAcct, setNewAcct] = useState({ account_code: '', account_name: '', type: 'ASSET' });

  useEffect(() => { accountingApi.getAccounts().then(setAccounts); }, []);

  const filtered = typeFilter ? accounts.filter(a => a.type === typeFilter) : accounts;

  const handleCreate = async (e) => {
    e.preventDefault();
    await accountingApi.createAccount(newAcct);
    setAccounts(await accountingApi.getAccounts());
    setNewAcct({ account_code: '', account_name: '', type: 'ASSET' });
    setShowForm(false);
  };

  const columns = [
    { key: 'code', label: 'Code', accessor: 'account_code', render: (r) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.account_code}</span> },
    { key: 'name', label: 'Account Name', accessor: 'account_name', render: (r) => <strong>{r.account_name}</strong> },
    { key: 'type', label: 'Type', accessor: 'type', render: (r) => <span className={`type-badge ${r.type.toLowerCase()}`}>{r.type}</span> },
  ];

  const filters = (
    <>
      {['', 'ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].map(t => (
        <button key={t} className={`filter-chip ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>{t || 'All'}</button>
      ))}
    </>
  );

  return (
    <>
      <div className="page-header">
        <div><h1>Chart of Accounts</h1><p className="page-subtitle">Ledger accounts for financial classification</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> New Account</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}><div className="card-body">
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Code</label><input className="form-input" value={newAcct.account_code} onChange={e => setNewAcct(p => ({ ...p, account_code: e.target.value }))} required style={{ width: 100 }} /></div>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}><label className="form-label">Name</label><input className="form-input" value={newAcct.account_name} onChange={e => setNewAcct(p => ({ ...p, account_name: e.target.value }))} required /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Type</label>
              <select className="form-select" value={newAcct.type} onChange={e => setNewAcct(p => ({ ...p, type: e.target.value }))}>
                {['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Add</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div></div>
      )}
      <DataTable columns={columns} data={filtered} searchPlaceholder="Search accounts..." actions={filters} />
    </>
  );
}
