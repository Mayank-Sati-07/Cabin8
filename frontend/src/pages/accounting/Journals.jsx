import { useState, useEffect } from 'react';
import { accountingApi } from '../../api';
import DataTable from '../../components/DataTable';

export default function Journals() {
  const [journals, setJournals] = useState([]);
  useEffect(() => { accountingApi.getJournals().then(setJournals); }, []);

  const columns = [
    { key: 'name', label: 'Journal Name', accessor: 'name', render: (r) => <strong>{r.name}</strong> },
    { key: 'type', label: 'Type', accessor: 'type', render: (r) => <span className={`type-badge ${r.type.toLowerCase()}`}>{r.type}</span> },
  ];

  return (
    <>
      <div className="page-header"><h1>Journals</h1></div>
      <DataTable columns={columns} data={journals} searchPlaceholder="Search journals..." />
    </>
  );
}
