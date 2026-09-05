import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';
import BackgroundVideo from '../../components/BackgroundVideo';

export default function SignUp() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: ROLES.INVOICING_USER });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ id: Date.now(), name: form.name, email: form.email, role: form.role });
    navigate('/');
  };

  return (
    <div className="auth-page">
      <BackgroundVideo />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">UF</div>
          <h1>Urban Furniture</h1>
        </div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join the Urban Furniture ERP platform</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-2)' }}>Create Account</button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/auth/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
