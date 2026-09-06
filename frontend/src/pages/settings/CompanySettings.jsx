import { useState, useEffect } from 'react';
import { settingsApi } from '../../api';

export default function CompanySettings() {
  const [form, setForm] = useState({ companyState: '', gstin: '' });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { settingsApi.get().then(s => setForm({ companyState: s.companyState || '', gstin: s.gstin || '' })); }, []);

  const handleChange = (field, value) => { setForm(prev => ({ ...prev, [field]: value })); setSaved(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await settingsApi.update(form);
      setSaved(true);
    } catch (err) {
      setError(err.message || 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-header"><h1>Company Settings</h1></div>
      <div className="card"><div className="card-body">
        {error && <div className="form-error" role="alert">{error}</div>}
        <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-muted-foreground)' }}>
          Your company's home state decides how GST is split on vendor bills and customer invoices —
          CGST + SGST when the vendor/customer is in this state, IGST otherwise.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Company State <span className="required">*</span></label>
              <input type="text" className="form-input" placeholder="e.g. Maharashtra" value={form.companyState} onChange={e => handleChange('companyState', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">GSTIN</label>
              <input type="text" className="form-input" placeholder="27AAAAA0000A1Z5" value={form.gstin} onChange={e => handleChange('gstin', e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            {saved && <span style={{ color: 'var(--color-success)', marginRight: 'auto' }}>Saved</span>}
            <button type="submit" className="btn btn-primary" disabled={saving}>Save Changes</button>
          </div>
        </form>
      </div></div>
    </>
  );
}
