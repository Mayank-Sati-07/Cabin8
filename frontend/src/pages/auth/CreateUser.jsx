import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES, ROLE_LABELS } from '../../constants/roles';
import { authApi, contactsApi } from '../../api';

export default function CreateUser() {
  const [form, setForm] = useState({ name: '', loginId: '', email: '', password: '', role: ROLES.ACCOUNTANT, contactId: '' });
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { contactsApi.getAll().then(setContacts).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = { ...form, contactId: form.contactId || null };
      const user = await authApi.createUser(payload);
      setSuccess(`User "${user.name}" created with role ${ROLE_LABELS[user.role]}.`);
      setForm({ name: '', loginId: '', email: '', password: '', role: ROLES.ACCOUNTANT, contactId: '' });
    } catch (err) {
      setError(err.message || 'Could not create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>Create User</h1><p className="page-subtitle">Admin only — provision new user accounts</p></div>
      </div>
      <div className="card">
        <div className="card-body">
          {error && <div className="form-error" role="alert">{error}</div>}
          {success && <div className="form-success" role="status">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input type="text" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Login Id <span className="required">*</span> <span style={{ fontWeight: 400 }}>(6-12 chars)</span></label>
                <input type="text" className="form-input" minLength={6} maxLength={12} value={form.loginId} onChange={e => setForm(f => ({ ...f, loginId: e.target.value }))} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email <span className="required">*</span></label>
                <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password <span className="required">*</span></label>
                <input type="password" className="form-input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Role <span className="required">*</span></label>
                <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              {form.role === ROLES.USER && (
                <div className="form-group">
                  <label className="form-label">Linked Contact</label>
                  <select className="form-select" value={form.contactId} onChange={e => setForm(f => ({ ...f, contactId: e.target.value }))}>
                    <option value="">Select contact</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
