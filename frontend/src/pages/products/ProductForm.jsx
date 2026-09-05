import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';
import { productsApi } from '../../api';

const emptyProduct = { name: '', type: 'GOODS', sales_price: 0, cost_price: 0, category: '', image_url: '', is_active: true };

export default function ProductForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const [form, setForm] = useState(emptyProduct);
  const navigate = useNavigate();

  useEffect(() => { if (!isNew) productsApi.getById(id).then(p => p && setForm(p)); }, [id, isNew]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNew) await productsApi.create(form);
    else await productsApi.update(id, form);
    navigate('/products');
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
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 'var(--space-6)' }}>
            <ImageUpload value={form.image_url} onChange={(v) => handleChange('image_url', v)} label="Product Image" />
            <div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Name <span className="required">*</span></label><input type="text" className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Type <span className="required">*</span></label>
                  <select className="form-select" value={form.type} onChange={e => handleChange('type', e.target.value)}><option value="GOODS">Goods</option><option value="SERVICE">Service</option><option value="COMBO">Combo</option></select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Sales Price <span className="required">*</span></label><input type="number" className="form-input" step="0.01" value={form.sales_price} onChange={e => handleChange('sales_price', parseFloat(e.target.value) || 0)} required /></div>
                <div className="form-group"><label className="form-label">Cost Price <span className="required">*</span></label><input type="number" className="form-input" step="0.01" value={form.cost_price} onChange={e => handleChange('cost_price', parseFloat(e.target.value) || 0)} required /></div>
              </div>
              <div className="form-group"><label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => handleChange('category', e.target.value)}>
                  <option value="">Select category</option>
                  {['Chairs', 'Tables', 'Sofas', 'Office Furniture', 'Services'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isNew ? 'Create Product' : 'Save Changes'}</button>
          </div>
        </form>
      </div></div>
    </>
  );
}
