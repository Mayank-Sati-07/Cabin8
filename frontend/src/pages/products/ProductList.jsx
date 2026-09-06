import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, List, LayoutGrid, Trash2 } from 'lucide-react';
import DataTable from '../../components/DataTable';
import KanbanBoard from '../../components/KanbanBoard';
import { productsApi, productCategoriesApi } from '../../api';
import { formatCurrency } from '../../utils/currency';
import { usePermission } from '../../hooks/usePermission';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState('list');
  const [catFilter, setCatFilter] = useState('');
  const navigate = useNavigate();
  const { isAdmin } = usePermission();

  const load = () => productsApi.getAll().then(setProducts);
  useEffect(() => { load(); productCategoriesApi.getAll().then(setCategories); }, []);

  const categoryName = (id) => categories.find(c => c.id === id)?.name || '—';
  const filtered = catFilter ? products.filter(p => String(p.categoryId) === catFilter) : products;

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this product?')) return;
    try {
      await productsApi.remove(id);
      load();
    } catch (err) {
      alert(err.message || 'Could not delete product');
    }
  };

  const columns = [
    { key: 'name', label: 'Product', accessor: 'name', render: (row) => <strong>{row.name}</strong> },
    { key: 'type', label: 'Type', accessor: 'type', render: (row) => <span className={`type-badge ${row.type.toLowerCase()}`}>{row.type}</span> },
    { key: 'category', label: 'Category', render: (row) => categoryName(row.categoryId) },
    { key: 'salesPrice', label: 'Sales Price', accessor: 'salesPrice', className: 'cell-amount', render: (row) => formatCurrency(row.salesPrice) },
    { key: 'cost', label: 'Cost', accessor: 'cost', className: 'cell-amount', render: (row) => formatCurrency(row.cost) },
    { key: 'gstRate', label: 'GST', accessor: 'gstRate', className: 'cell-amount', render: (row) => `${row.gstRate || 0}%` },
    { key: 'margin', label: 'Margin %', className: 'cell-amount', render: (row) => {
      const margin = row.salesPrice > 0 ? (((row.salesPrice - row.cost) / row.salesPrice) * 100).toFixed(1) : '0.0';
      return <span style={{ color: margin > 0 ? 'var(--color-success)' : 'var(--color-destructive)' }}>{margin}%</span>;
    }},
    { key: 'actions', label: '', sortable: false, width: '120px', render: (row) => (
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button className="btn btn-sm btn-ghost" onClick={(e) => { e.stopPropagation(); navigate(`/products/${row.id}`); }}>Edit</button>
        {isAdmin && <button className="btn btn-sm btn-ghost" onClick={(e) => handleDelete(e, row.id)} aria-label="Delete"><Trash2 size={14} /></button>}
      </div>
    )},
  ];

  const renderCard = (product) => (
    <div className="kanban-card" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="kanban-card-header">
        <div className="kanban-card-title">{product.name}</div>
        <span className={`type-badge ${product.type.toLowerCase()}`}>{product.type}</span>
      </div>
      <div className="kanban-card-body">
        <div className="card-row"><span>Sales Price</span><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(product.salesPrice)}</span></div>
        <div className="card-row"><span>Cost</span><span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(product.cost)}</span></div>
        <div className="card-row"><span>Category</span><span>{categoryName(product.categoryId)}</span></div>
      </div>
    </div>
  );

  const filterBtns = (
    <>
      <button className={`filter-chip ${catFilter === '' ? 'active' : ''}`} onClick={() => setCatFilter('')}>All</button>
      {categories.map(c => (
        <button key={c.id} className={`filter-chip ${catFilter === String(c.id) ? 'active' : ''}`} onClick={() => setCatFilter(String(c.id))}>{c.name}</button>
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
