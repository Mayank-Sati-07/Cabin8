import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import DataTable from '../../components/DataTable';
import { analyticAccountsApi } from '../../api';
import { usePermission } from '../../hooks/usePermission';

export default function AnalyticAccountList() {
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();
  const { isAdmin } = usePermission();

  const load = () => analyticAccountsApi.getAll().then(setAccounts);
  useEffect(() => { load(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this analytic account?')) return;
    try { await analyticAccountsApi.remove(id); load(); } catch (err) { alert(err.message || 'Could not delete'); }
  };

  const columns = [
    { key: 'name', label: 'Name', accessor: 'name', render: (r) => <strong>{r.name}</strong> },
    { key: 'type', label: 'Type', accessor: 'type', render: (r) => <span className={`type-badge ${r.type.toLowerCase()}`}>{r.type}</span> },
    { key: 'actions', label: '', sortable: false, width: '120px', render: (r) => (
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); navigate(`/analytics/${r.id}`); }}>Edit</button>
        {isAdmin && <button className="btn btn-sm btn-ghost" onClick={(e) => handleDelete(e, r.id)} aria-label="Delete"><Trash2 size={14} /></button>}
      </div>
    )},
  ];

  return (
    <>
      <div className="page-header"><h1>Analytic Accounts</h1><button className="btn btn-primary" onClick={() => navigate('/analytics/new')}><Plus size={16} /> New Account</button></div>
      <DataTable columns={columns} data={accounts} onRowClick={(r) => navigate(`/analytics/${r.id}`)} searchPlaceholder="Search analytic accounts..." />
    </>
  );
}
