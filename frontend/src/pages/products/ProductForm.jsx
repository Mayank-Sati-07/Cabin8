import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';
import { productsApi, productCategoriesApi } from '../../api';

const emptyProduct = { name: '', type: 'GOODS', salesPrice: 0, cost: 0, gstRate: 0, categoryId: '', image: '' };

export default function ProductForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const [form, setForm] = useState(emptyProduct);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    productCategoriesApi.getAll().then(setCategories);
    if (!isNew) productsApi.getById(id).then(p => p && setForm({ ...emptyProduct, ...p, categoryId: p.categoryId || '' }));
  }, [id, isNew]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAddCategory = async () => {
    const name = window.prompt('New category name');
    if (!name) return;
    try {
      const category = await productCategoriesApi.create({ name });
      setCategories(prev => [...prev, category]);
      handleChange('categoryId', category.id);
    } catch (err) {
      alert(err.message || 'Could not create category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      name: form.name,
      type: form.type,
      salesPrice: parseFloat(form.salesPrice) || 0,
      cost: parseFloat(form.cost) || 0,
      gstRate: parseFloat(form.gstRate) || 0,
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      image: form.image || null,
    };
    try {
      if (isNew) await productsApi.create(payload);
      else await productsApi.update(id, payload);
      navigate('/products');
    } catch (err) {
      setError(err.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/products')}><ArrowLeft size={20} /></button>
          <h1>{isNew ? 'New Product' : `Edit: ${form.name}`}</h1>
        </div>
      </div>
      <div className="card"><div className="card-body">
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 'var(--space-6)' }}>
            <ImageUpload value={form.image} onChange={(v) => handleChange('image', v)} label="Product Image" />
            <div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Name <span className="required">*</span></label><input type="text" className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Type <span className="required">*</span></label>
                  <select className="form-select" value={form.type} onChange={e => handleChange('type', e.target.value)}><option value="GOODS">Goods</option><option value="SERVICE">Service</option><option value="COMBO">Combo</option></select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Sales Price <span className="required">*</span></label><input type="number" className="form-input" step="0.01" value={form.salesPrice} onChange={e => handleChange('salesPrice', e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Cost <span className="required">*</span></label><input type="number" className="form-input" step="0.01" value={form.cost} onChange={e => handleChange('cost', e.target.value)} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">GST Rate (%)</label>
                  <select className="form-select" value={form.gstRate} onChange={e => handleChange('gstRate', e.target.value)}>
                    <option value="0">Exempt (0%)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Category</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <select className="form-select" value={form.categoryId} onChange={e => handleChange('categoryId', e.target.value)}>
                    <option value="">No category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button type="button" className="btn btn-secondary" onClick={handleAddCategory}>+ New</button>
                </div>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{isNew ? 'Create Product' : 'Save Changes'}</button>
          </div>
        </form>
      </div></div>
    </>
  );
}
