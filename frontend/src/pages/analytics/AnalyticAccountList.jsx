import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DataTable from '../../components/DataTable';
import { budgetApi } from '../../api';

export default function AnalyticAccountList() {
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { budgetApi.getAnalyticAccounts().then(setAccounts); }, []);

  const columns = [
    { key: 'code', label: 'Code', accessor: 'code', render: (r) => <span style={{ fontFamily: 'var(--font-mono)' }}>{r.code}</span> },
    { key: 'name', label: 'Name', accessor: 'name', render: (r) => <strong>{r.name}</strong> },
    { key: 'type', label: 'Type', accessor: 'type', render: (r) => <span className={`type-badge ${r.type.toLowerCase()}`}>{r.type}</span> },
    { key: 'desc', label: 'Description', accessor: 'description' },
    { key: 'actions', label: '', sortable: false, width: '80px', render: (r) => <button className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); navigate(`/analytics/${r.id}`); }}>Edit</button> },
  ];

  return (
    <>
      <div className="page-header"><h1>Analytic Accounts</h1><button className="btn btn-primary" onClick={() => navigate('/analytics/new')}><Plus size={16} /> New Account</button></div>
      <DataTable columns={columns} data={accounts} searchPlaceholder="Search analytic accounts..." />
    </>
  );
}
