import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { salesApi } from '../../api';
import { formatCurrency } from '../../utils/currency';
import { calculateOrderTotals } from '../../utils/taxCalc';

export default function SalesOrderList() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { salesApi.getOrders().then(setOrders); }, []);

  const columns = [
    { key: 'soNumber', label: 'SO #', render: (r) => <strong style={{ fontFamily: 'var(--font-mono)' }}>{r.soNumber}</strong> },
    { key: 'customer', label: 'Customer', render: (r) => r.customer?.name || '—' },
    { key: 'date', label: 'Order Date', render: (r) => new Date(r.date).toLocaleDateString() },
    { key: 'total', label: 'Total', className: 'cell-amount', render: (r) => formatCurrency(calculateOrderTotals(r.lines || []).grandTotal) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', sortable: false, width: '80px', render: (r) => <button className="btn btn-sm btn-ghost" onClick={e => { e.stopPropagation(); navigate(`/sales/orders/${r.id}`); }}>View</button> },
  ];

  return (
    <>
      <div className="page-header"><h1>Sales Orders</h1><button className="btn btn-primary" onClick={() => navigate('/sales/orders/new')}><Plus size={16} /> New SO</button></div>
      <DataTable columns={columns} data={orders} onRowClick={(r) => navigate(`/sales/orders/${r.id}`)} searchPlaceholder="Search sales orders..." />
    </>
  );
}
