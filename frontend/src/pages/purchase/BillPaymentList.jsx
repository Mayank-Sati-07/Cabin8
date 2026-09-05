import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { paymentsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function BillPaymentList() {
  const [payments, setPayments] = useState([]);
  useEffect(() => { paymentsApi.getAll('SEND').then(setPayments); }, []);

  const columns = [
    { key: 'date', label: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
    { key: 'vendor', label: 'Vendor', render: (r) => r.partner?.name || '—' },
    { key: 'amount', label: 'Amount', className: 'cell-amount', render: (r) => formatCurrency(r.amount) },
    { key: 'method', label: 'Method', accessor: 'method' },
    { key: 'note', label: 'Note', accessor: 'note' },
  ];

  return (
    <>
      <div className="page-header"><h1>Bill Payments</h1></div>
      <DataTable columns={columns} data={payments} searchPlaceholder="Search payments..." />
    </>
  );
}
