import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { purchaseApi, contactsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';
import { calculateOrderTotals } from '../../utils/taxCalc';

export default function PurchaseOrderList() {
  const [orders, setOrders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { Promise.all([purchaseApi.getOrders(), contactsApi.getAll()]).then(([o, c]) => { setOrders(o); setContacts(c); }); }, []);

  const getVendorName = (id) => contacts.find(c => c.id === id)?.name || '—';

  const columns = [
    { key: 'ref', label: 'PO #', accessor: 'reference', render: (r) => <strong style={{ fontFamily: 'var(--font-mono)' }}>{r.reference}</strong> },
    { key: 'vendor', label: 'Vendor', render: (r) => getVendorName(r.vendor_id) },
    { key: 'date', label: 'Order Date', accessor: 'order_date' },
    { key: 'total', label: 'Total', className: 'cell-amount', render: (r) => formatCurrency(calculateOrderTotals(r.lines || []).grandTotal) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', sortable: false, width: '80px', render: (r) => <button className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); navigate(`/purchase/orders/${r.id}`); }}>View</button> },
  ];

  return (
    <>
      <div className="page-header"><h1>Purchase Orders</h1><button className="btn btn-primary" onClick={() => navigate('/purchase/orders/new')}><Plus size={16} /> New PO</button></div>
      <DataTable columns={columns} data={orders} onRowClick={(r) => navigate(`/purchase/orders/${r.id}`)} searchPlaceholder="Search purchase orders..." />
    </>
  );
}
