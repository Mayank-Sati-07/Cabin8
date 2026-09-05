import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, List, LayoutGrid } from 'lucide-react';
import DataTable from '../../components/DataTable';
import KanbanBoard from '../../components/KanbanBoard';
import { productsApi } from '../../api';
import { formatCurrency } from '../../utils/currency';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [view, setView] = useState('list');
  const [catFilter, setCatFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => { productsApi.getAll().then(setProducts); }, []);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = catFilter ? products.filter(p => p.category === catFilter) : products;

  const columns = [
    { key: 'name', label: 'Product', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
    { key: 'type', label: 'Type', accessor: 'type', render: (row) => <span className={`type-badge ${row.type.toLowerCase()}`}>{row.type}</span> },
    { key: 'category', label: 'Category', accessor: 'category' },
    { key: 'sales_price', label: 'Sales Price', accessor: 'sales_price', className: 'cell-amount', render: (row) => formatCurrency(row.sales_price) },
    { key: 'cost_price', label: 'Cost Price', accessor: 'cost_price', className: 'cell-amount', render: (row) => formatCurrency(row.cost_price) },
    { key: 'margin', label: 'Margin %', className: 'cell-amount', render: (row) => {
      const margin = row.sales_price > 0 ? (((row.sales_price - row.cost_price) / row.sales_price) * 100).toFixed(1) : '0.0';
      return <span style={{ color: margin > 0 ? 'var(--color-success)' : 'var(--color-destructive)' }}>{margin}%</span>;
    }},
    { key: 'actions', label: '', sortable: false, width: '80px', render: (row) => (
      <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); navigate(`/products/${row.id}`); }}>Edit</button>
    )},
  ];

  const renderCard = (product) => (
    <div className="kanban-card" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="kanban-card-header">
        <div className="kanban-card-title">{product.name}</div>
        <span className={`type-badge ${product.type.toLowerCase()}`}>{product.type}</span>
      </div>
      <div className="kanban-card-body">
        <div className="card-row"><span>Sales Price</span><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(product.sales_price)}</span></div>
        <div className="card-row"><span>Cost Price</span><span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(product.cost_price)}</span></div>
        <div className="card-row"><span>Category</span><span>{product.category}</span></div>
      </div>
    </div>
  );

  const filterBtns = (
    <>
      <button className={`filter-chip ${catFilter === '' ? 'active' : ''}`} onClick={() => setCatFilter('')}>All</button>
      {categories.map(c => (
        <button key={c} className={`filter-chip ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
      ))}
    </>
  );

  return (
    <>
      <div className="page-header">
        <div><h1>Products</h1><p className="page-subtitle">Manage your product catalog</p></div>
        <div className="page-header-actions">
          <div className="view-toggle">
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><List size={16} /> List</button>
            <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}><LayoutGrid size={16} /> Kanban</button>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/products/new')}><Plus size={16} /> New Product</button>
        </div>
      </div>
      {view === 'list' ? (
        <DataTable columns={columns} data={filtered} onRowClick={(row) => navigate(`/products/${row.id}`)} searchPlaceholder="Search products..." actions={filterBtns} />
      ) : (
        <>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>{filterBtns}</div>
          <KanbanBoard items={filtered} renderCard={renderCard} />
        </>
      )}
    </>
  );
}
