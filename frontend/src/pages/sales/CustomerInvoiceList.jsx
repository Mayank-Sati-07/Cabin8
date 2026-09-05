import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { salesApi, contactsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';
import { calculateOrderTotals } from '../../utils/taxCalc';

export default function CustomerInvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { Promise.all([salesApi.getInvoices(), contactsApi.getAll()]).then(([i, c]) => { setInvoices(i); setContacts(c); }); }, []);

  const columns = [
    { key: 'id', label: 'Invoice #', render: (r) => <strong>{r.id}</strong> },
    { key: 'customer', label: 'Customer', render: (r) => contacts.find(c => c.id === r.customer_id)?.name || '—' },
    { key: 'date', label: 'Invoice Date', accessor: 'invoice_date' },
    { key: 'due', label: 'Due Date', accessor: 'due_date' },
    { key: 'total', label: 'Amount', className: 'cell-amount', render: (r) => formatCurrency(calculateOrderTotals(r.lines || []).grandTotal) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <div className="page-header"><h1>Customer Invoices</h1></div>
      <DataTable columns={columns} data={invoices} onRowClick={(r) => navigate(`/sales/invoices/${r.id}`)} searchPlaceholder="Search invoices..." />
    </>
  );
}
