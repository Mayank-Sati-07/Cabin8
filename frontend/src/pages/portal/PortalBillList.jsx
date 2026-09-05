import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { purchaseApi } from '../../api';
import { formatCurrency } from '../../utils/currency';
import { calculateOrderTotals } from '../../utils/taxCalc';

export default function PortalBillList() {
  const [bills, setBills] = useState([]);
  useEffect(() => { purchaseApi.getBills().then(setBills); }, []);

  const columns = [
    { key: 'ref', label: 'Bill Ref', render: (r) => <strong>{r.vendor_ref || r.id}</strong> },
    { key: 'date', label: 'Date', accessor: 'bill_date' },
    { key: 'due', label: 'Due Date', accessor: 'due_date' },
    { key: 'total', label: 'Amount', className: 'cell-amount', render: (r) => formatCurrency(calculateOrderTotals(r.lines || []).grandTotal) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <div className="page-header"><h1>My Bills</h1></div>
      <DataTable columns={columns} data={bills} searchPlaceholder="Search bills..." />
    </>
  );
}
