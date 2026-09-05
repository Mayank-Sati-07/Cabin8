import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';
import { contactsApi } from '../../api';

const emptyContact = { name: '', type: 'CUSTOMER', email: '', mobile: '', street: '', city: '', state: '', pincode: '', profile_image_url: '', is_active: true };

export default function ContactForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const [form, setForm] = useState(emptyContact);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNew) contactsApi.getById(id).then(c => c && setForm(c));
  }, [id, isNew]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNew) await contactsApi.create(form);
    else await contactsApi.update(id, form);
    navigate('/contacts');
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/contacts')}><ArrowLeft size={20} /></button>
          <div><h1>{isNew ? 'New Contact' : `Edit: ${form.name}`}</h1></div>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 'var(--space-6)' }}>
              <ImageUpload value={form.profile_image_url} onChange={(v) => handleChange('profile_image_url', v)} label="Profile Photo" />
              <div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type <span className="required">*</span></label>
                    <select className="form-select" value={form.type} onChange={e => handleChange('type', e.target.value)}>
                      <option value="CUSTOMER">Customer</option>
                      <option value="VENDOR">Vendor</option>
                      <option value="BOTH">Both</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" value={form.email} onChange={e => handleChange('email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-input" value={form.mobile} onChange={e => handleChange('mobile', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
            <h3 style={{ margin: 'var(--space-6) 0 var(--space-3)', fontWeight: 'var(--weight-semibold)' }}>Address</h3>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Street</label><input type="text" className="form-input" value={form.street} onChange={e => handleChange('street', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">City</label><input type="text" className="form-input" value={form.city} onChange={e => handleChange('city', e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">State</label><input type="text" className="form-input" value={form.state} onChange={e => handleChange('state', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Pincode</label><input type="text" className="form-input" value={form.pincode} onChange={e => handleChange('pincode', e.target.value)} /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/contacts')}>Cancel</button>
              <button type="submit" className="btn btn-primary">{isNew ? 'Create Contact' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
