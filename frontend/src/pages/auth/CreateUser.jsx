import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES, ROLE_LABELS } from '../../constants/roles';

export default function CreateUser() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: ROLES.INVOICING_USER, contact_id: '' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`User "${form.name}" created with role ${ROLE_LABELS[form.role]}!`);
    navigate('/');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>Create User</h1><p className="page-subtitle">Admin only — provision new user accounts</p></div>
      </div>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input type="text" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email <span className="required">*</span></label>
                <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password <span className="required">*</span></label>
                <input type="password" className="form-input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role <span className="required">*</span></label>
                <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create User</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
