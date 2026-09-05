import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import DataTable from '../../components/DataTable';
import { accountsApi } from '../../api';
import { ACCOUNT_TYPES } from '../../constants/statuses';
import { usePermission } from '../../hooks/usePermission';

const TYPES = Object.values(ACCOUNT_TYPES);

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newAcct, setNewAcct] = useState({ name: '', type: 'ASSET' });
  const [error, setError] = useState('');
  const { isAdmin } = usePermission();

  const load = () => accountsApi.getAll().then(setAccounts);
  useEffect(() => { load(); }, []);

  const filtered = typeFilter ? accounts.filter(a => a.type === typeFilter) : accounts;

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await accountsApi.create(newAcct);
      setNewAcct({ name: '', type: 'ASSET' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message || 'Could not create account');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    try {
      await accountsApi.remove(id);
      load();
    } catch (err) {
      alert(err.message || 'Could not delete account');
    }
  };

  const columns = [
    { key: 'name', label: 'Account Name', accessor: 'name', render: (r) => <strong>{r.name}</strong> },
    { key: 'type', label: 'Type', accessor: 'type', render: (r) => <span className={`type-badge ${r.type.toLowerCase()}`}>{r.type}</span> },
    { key: 'actions', label: '', sortable: false, width: '60px', render: (r) => (
      isAdmin && <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(r.id)} aria-label="Delete"><Trash2 size={14} /></button>
    )},
  ];

  const filters = (
    <>
      {['', ...TYPES].map(t => (
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
          {error && <div className="form-error" role="alert">{error}</div>}
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}><label className="form-label">Name</label><input className="form-input" value={newAcct.name} onChange={e => setNewAcct(p => ({ ...p, name: e.target.value }))} required /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Type</label>
              <select className="form-select" value={newAcct.type} onChange={e => setNewAcct(p => ({ ...p, type: e.target.value }))}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
