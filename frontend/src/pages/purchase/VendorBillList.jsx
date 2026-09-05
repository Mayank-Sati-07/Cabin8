import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { purchaseApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function VendorBillList() {
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { purchaseApi.getBills().then(setBills); }, []);

  const columns = [
    { key: 'billNumber', label: 'Bill #', render: (r) => <strong style={{ fontFamily: 'var(--font-mono)' }}>{r.billNumber}</strong> },
    { key: 'vendorBillNo', label: 'Vendor Ref', accessor: 'vendorBillNo', render: (r) => r.vendorBillNo || '—' },
    { key: 'vendor', label: 'Vendor', render: (r) => r.vendor?.name || '—' },
    { key: 'date', label: 'Bill Date', render: (r) => new Date(r.billDate).toLocaleDateString() },
    { key: 'due', label: 'Due Date', render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—' },
    { key: 'total', label: 'Amount', className: 'cell-amount', render: (r) => formatCurrency(r.totalAmount) },
    { key: 'paid', label: 'Paid', className: 'cell-amount', render: (r) => formatCurrency(r.amountPaid) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <div className="page-header"><h1>Vendor Bills</h1></div>
      <DataTable columns={columns} data={bills} onRowClick={(r) => navigate(`/purchase/bills/${r.id}`)} searchPlaceholder="Search bills..." />
    </>
  );
}
