import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import DataTable from '../../components/DataTable';
import { productCategoriesApi } from '../../api';
import { usePermission } from '../../hooks/usePermission';

export default function ProductCategoryList() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAdmin } = usePermission();

  const load = () => productCategoriesApi.getAll().then(setCategories);
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!newName.trim()) return;
    try {
      await productCategoriesApi.create({ name: newName.trim() });
      setNewName('');
      load();
    } catch (err) {
      setError(err.message || 'Could not create category');
    }
  };

  const startEdit = (row) => { setEditingId(row.id); setEditingName(row.name); };

  const handleRename = async (id) => {
    setError('');
    try {
      await productCategoriesApi.update(id, { name: editingName.trim() });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message || 'Could not rename category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await productCategoriesApi.remove(id);
      load();
    } catch (err) {
      alert(err.message || 'Could not delete category');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', accessor: 'name', render: (r) => (
      editingId === r.id
        ? <input className="form-input" value={editingName} onChange={e => setEditingName(e.target.value)} autoFocus />
        : <strong>{r.name}</strong>
    )},
    { key: 'products', label: 'Products', sortable: false, render: (r) => r._count?.products ?? 0 },
    { key: 'actions', label: '', sortable: false, width: '120px', render: (r) => (
      editingId === r.id ? (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-sm btn-ghost" onClick={() => handleRename(r.id)} aria-label="Save"><Check size={14} /></button>
          <button className="btn btn-sm btn-ghost" onClick={() => setEditingId(null)} aria-label="Cancel"><X size={14} /></button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-sm btn-ghost" onClick={() => startEdit(r)} aria-label="Rename"><Pencil size={14} /></button>
          {isAdmin && <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(r.id)} aria-label="Delete"><Trash2 size={14} /></button>}
        </div>
      )
    )},
  ];

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/products')}><ArrowLeft size={20} /></button>
          <h1>Product Categories</h1>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}><div className="card-body">
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <input className="form-input" placeholder="New category name" value={newName} onChange={e => setNewName(e.target.value)} />
          <button type="submit" className="btn btn-primary"><Plus size={16} /> Add</button>
        </form>
      </div></div>
      <DataTable columns={columns} data={categories} searchPlaceholder="Search categories..." />
    </>
  );
}
