import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { purchaseApi, contactsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';
import { calculateOrderTotals } from '../../utils/taxCalc';

export default function VendorBillList() {
  const [bills, setBills] = useState([]);
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { Promise.all([purchaseApi.getBills(), contactsApi.getAll()]).then(([b, c]) => { setBills(b); setContacts(c); }); }, []);

  const columns = [
    { key: 'ref', label: 'Bill Ref', render: (r) => <strong>{r.vendor_ref || r.id}</strong> },
    { key: 'vendor', label: 'Vendor', render: (r) => contacts.find(c => c.id === r.vendor_id)?.name || '—' },
    { key: 'date', label: 'Bill Date', accessor: 'bill_date' },
    { key: 'due', label: 'Due Date', accessor: 'due_date' },
    { key: 'total', label: 'Amount', className: 'cell-amount', render: (r) => formatCurrency(calculateOrderTotals(r.lines || []).grandTotal) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <div className="page-header"><h1>Vendor Bills</h1></div>
      <DataTable columns={columns} data={bills} onRowClick={(r) => navigate(`/purchase/bills/${r.id}`)} searchPlaceholder="Search bills..." />
    </>
  );
}
