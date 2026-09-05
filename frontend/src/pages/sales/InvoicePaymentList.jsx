import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { paymentsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function InvoicePaymentList() {
  const [payments, setPayments] = useState([]);
  useEffect(() => { paymentsApi.getAll('RECEIVE').then(setPayments); }, []);

  const columns = [
    { key: 'date', label: 'Date', render: (r) => new Date(r.date).toLocaleDateString() },
    { key: 'customer', label: 'Customer', render: (r) => r.partner?.name || '—' },
    { key: 'amount', label: 'Amount', className: 'cell-amount', render: (r) => formatCurrency(r.amount) },
    { key: 'method', label: 'Method', accessor: 'method' },
    { key: 'note', label: 'Note', accessor: 'note' },
  ];

  return (
    <>
      <div className="page-header"><h1>Invoice Payments</h1></div>
      <DataTable columns={columns} data={payments} searchPlaceholder="Search payments..." />
    </>
  );
}
