import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { journalEntriesApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function JournalEntryList() {
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { journalEntriesApi.getAll().then(setEntries); }, []);

  const columns = [
    { key: 'id', label: 'Entry #', render: (r) => <strong style={{ fontFamily: 'var(--font-mono)' }}>JE-{r.id}</strong> },
    { key: 'journal', label: 'Journal', render: (r) => r.journal?.name || '—' },
    { key: 'date', label: 'Date', render: (r) => new Date(r.accountingDate).toLocaleDateString() },
    { key: 'reference', label: 'Reference', accessor: 'reference' },
    { key: 'total', label: 'Total', className: 'cell-amount', render: (r) => formatCurrency(r.items?.reduce((s, i) => s + i.debit, 0) || 0) },
    { key: 'status', label: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <div className="page-header">
        <h1>Journal Entries</h1>
        <button className="btn btn-primary" onClick={() => navigate('/accounting/entries/new')}><Plus size={16} /> New Entry</button>
      </div>
      <DataTable columns={columns} data={entries} onRowClick={(r) => navigate(`/accounting/entries/${r.id}`)} searchPlaceholder="Search entries..." />
    </>
  );
}
