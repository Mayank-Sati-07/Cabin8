import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { salesApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function CustomerInvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { salesApi.getInvoices().then(setInvoices); }, []);

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #', render: (r) => <strong>{r.invoiceNumber}</strong> },
    { key: 'customer', label: 'Customer', render: (r) => r.customer?.name || '—' },
    { key: 'date', label: 'Invoice Date', render: (r) => new Date(r.invoiceDate).toLocaleDateString() },
    { key: 'due', label: 'Due Date', render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—' },
    { key: 'total', label: 'Amount', className: 'cell-amount', render: (r) => formatCurrency(r.totalAmount) },
    { key: 'paid', label: 'Paid', className: 'cell-amount', render: (r) => formatCurrency(r.amountPaid) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <div className="page-header"><h1>Customer Invoices</h1></div>
      <DataTable columns={columns} data={invoices} onRowClick={(r) => navigate(`/sales/invoices/${r.id}`)} searchPlaceholder="Search invoices..." />
    </>
  );
}
