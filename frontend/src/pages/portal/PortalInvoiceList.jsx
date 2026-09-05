import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { portalApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function PortalInvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { portalApi.getInvoices().then(setInvoices); }, []);

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #', render: (r) => <strong>{r.invoiceNumber}</strong> },
    { key: 'date', label: 'Date', render: (r) => new Date(r.invoiceDate).toLocaleDateString() },
    { key: 'due', label: 'Due Date', render: (r) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—' },
    { key: 'total', label: 'Amount', className: 'cell-amount', render: (r) => formatCurrency(r.totalAmount) },
    { key: 'paid', label: 'Paid', className: 'cell-amount', render: (r) => formatCurrency(r.amountPaid) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', sortable: false, width: '100px', render: (r) => (
      r.status === 'CONFIRMED' && <button className="btn btn-sm btn-primary" onClick={e => { e.stopPropagation(); navigate(`/portal/payment?invoice_id=${r.id}`); }}>Pay</button>
    )},
  ];

  return (
    <>
      <div className="page-header"><h1>My Invoices</h1></div>
      <DataTable columns={columns} data={invoices} searchPlaceholder="Search invoices..." />
    </>
  );
}
