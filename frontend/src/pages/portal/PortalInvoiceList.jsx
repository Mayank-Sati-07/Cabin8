import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { salesApi, contactsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';
import { calculateOrderTotals } from '../../utils/taxCalc';

export default function PortalInvoiceList() {
  const [invoices, setInvoices] = useState([]);
  useEffect(() => { salesApi.getInvoices().then(setInvoices); }, []);

  const columns = [
    { key: 'id', label: 'Invoice #', render: (r) => <strong>{r.id}</strong> },
    { key: 'date', label: 'Date', accessor: 'invoice_date' },
    { key: 'due', label: 'Due Date', accessor: 'due_date' },
    { key: 'total', label: 'Amount', className: 'cell-amount', render: (r) => formatCurrency(calculateOrderTotals(r.lines || []).grandTotal) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <div className="page-header"><h1>My Invoices</h1></div>
      <DataTable columns={columns} data={invoices} searchPlaceholder="Search invoices..." />
    </>
  );
}
