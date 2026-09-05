import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { portalApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function PortalBillList() {
  const [bills, setBills] = useState([]);
  useEffect(() => { portalApi.getBills().then(setBills); }, []);

  const columns = [
    { key: 'billNumber', label: 'Bill #', render: (r) => <strong>{r.billNumber}</strong> },
    { key: 'date', label: 'Date', render: (r) => new Date(r.billDate).toLocaleDateString() },
    { key: 'due', label: 'Due Date', render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—' },
    { key: 'total', label: 'Amount', className: 'cell-amount', render: (r) => formatCurrency(r.totalAmount) },
    { key: 'paid', label: 'Paid', className: 'cell-amount', render: (r) => formatCurrency(r.amountPaid) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <div className="page-header"><h1>My Bills</h1></div>
      <DataTable columns={columns} data={bills} searchPlaceholder="Search bills..." />
    </>
  );
}
