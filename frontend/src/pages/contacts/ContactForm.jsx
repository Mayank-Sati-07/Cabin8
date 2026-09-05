import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';
import { contactsApi } from '../../api';

const emptyContact = { name: '', email: '', phone: '', image: '', street: '', city: '', state: '', country: '', pincode: '' };

export default function ContactForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const [form, setForm] = useState(emptyContact);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNew) contactsApi.getById(id).then(c => c && setForm({ ...emptyContact, ...c }));
  }, [id, isNew]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      image: form.image || null,
      street: form.street || null,
      city: form.city || null,
      state: form.state || null,
      country: form.country || null,
      pincode: form.pincode || null,
    };
    try {
      if (isNew) await contactsApi.create(payload);
      else await contactsApi.update(id, payload);
      navigate('/contacts');
    } catch (err) {
      setError(err.message || 'Could not save contact');
    } finally {
      setSaving(false);
    }
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
          {error && <div className="form-error" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 'var(--space-6)' }}>
              <ImageUpload value={form.image} onChange={(v) => handleChange('image', v)} label="Profile Photo" />
              <div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name <span className="required">*</span></label>
                    <input type="text" className="form-input" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span className="required">*</span></label>
                    <input type="email" className="form-input" value={form.email} onChange={e => handleChange('email', e.target.value)} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-input" value={form.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
            <h3 style={{ margin: 'var(--space-6) 0 var(--space-3)', fontWeight: 'var(--weight-semibold)' }}>Address</h3>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Street</label><input type="text" className="form-input" value={form.street || ''} onChange={e => handleChange('street', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">City</label><input type="text" className="form-input" value={form.city || ''} onChange={e => handleChange('city', e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">State</label><input type="text" className="form-input" value={form.state || ''} onChange={e => handleChange('state', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Country</label><input type="text" className="form-input" value={form.country || ''} onChange={e => handleChange('country', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Pincode</label><input type="text" className="form-input" value={form.pincode || ''} onChange={e => handleChange('pincode', e.target.value)} /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/contacts')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{isNew ? 'Create Contact' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
