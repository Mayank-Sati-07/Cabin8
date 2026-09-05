import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { journalsApi, accountsApi } from '../../api';
import { JOURNAL_TYPES } from '../../constants/statuses';
import DataTable from '../../components/DataTable';

const TYPES = Object.values(JOURNAL_TYPES);

export default function Journals() {
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newJournal, setNewJournal] = useState({ name: '', type: 'SALES', defaultAccountId: '' });
  const [error, setError] = useState('');

  const load = () => journalsApi.getAll().then(setJournals);
  useEffect(() => { load(); accountsApi.getAll().then(setAccounts); }, []);

  const accountName = (id) => accounts.find(a => a.id === id)?.name || '—';

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await journalsApi.create({ ...newJournal, defaultAccountId: parseInt(newJournal.defaultAccountId) });
      setNewJournal({ name: '', type: 'SALES', defaultAccountId: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message || 'Could not create journal');
    }
  };

  const columns = [
    { key: 'name', label: 'Journal Name', accessor: 'name', render: (r) => <strong>{r.name}</strong> },
    { key: 'type', label: 'Type', accessor: 'type', render: (r) => <span className={`type-badge ${r.type.toLowerCase()}`}>{r.type}</span> },
    { key: 'defaultAccount', label: 'Default Account', render: (r) => accountName(r.defaultAccountId) },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Journals</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> New Journal</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}><div className="card-body">
          {error && <div className="form-error" role="alert">{error}</div>}
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}><label className="form-label">Name</label><input className="form-input" value={newJournal.name} onChange={e => setNewJournal(p => ({ ...p, name: e.target.value }))} required /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Type</label>
              <select className="form-select" value={newJournal.type} onChange={e => setNewJournal(p => ({ ...p, type: e.target.value }))}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Default Account</label>
              <select className="form-select" value={newJournal.defaultAccountId} onChange={e => setNewJournal(p => ({ ...p, defaultAccountId: e.target.value }))} required>
                <option value="">Select account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Add</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div></div>
      )}
      <DataTable columns={columns} data={journals} searchPlaceholder="Search journals..." />
    </>
  );
}
