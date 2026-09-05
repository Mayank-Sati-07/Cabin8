import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import { salesApi, contactsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function InvoicePaymentList() {
  const [payments, setPayments] = useState([]);
  const [contacts, setContacts] = useState([]);
  useEffect(() => { Promise.all([salesApi.getPayments(), contactsApi.getAll()]).then(([p, c]) => { setPayments(p); setContacts(c); }); }, []);

  const columns = [
    { key: 'date', label: 'Date', accessor: 'date' },
    { key: 'customer', label: 'Customer', render: (r) => contacts.find(c => c.id === r.partner_id)?.name || '—' },
    { key: 'amount', label: 'Amount', className: 'cell-amount', render: (r) => formatCurrency(r.amount) },
    { key: 'ref', label: 'Reference', accessor: 'reference' },
  ];

  return (
    <>
      <div className="page-header"><h1>Invoice Payments</h1></div>
      <DataTable columns={columns} data={payments} searchPlaceholder="Search payments..." />
    </>
  );
}
