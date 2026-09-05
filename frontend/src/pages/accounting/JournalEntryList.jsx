import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { accountingApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function JournalEntryList() {
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { accountingApi.getJournalEntries().then(setEntries); }, []);

  const columns = [
    { key: 'number', label: 'Entry #', accessor: 'entry_number', render: (r) => <strong style={{ fontFamily: 'var(--font-mono)' }}>{r.entry_number}</strong> },
    { key: 'date', label: 'Date', accessor: 'date' },
    { key: 'reference', label: 'Reference', accessor: 'reference' },
    { key: 'total', label: 'Total', className: 'cell-amount', render: (r) => formatCurrency(r.items?.reduce((s, i) => s + i.debit, 0) || 0) },
    { key: 'state', label: 'Status', accessor: 'state', render: (r) => <StatusBadge status={r.state} /> },
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
