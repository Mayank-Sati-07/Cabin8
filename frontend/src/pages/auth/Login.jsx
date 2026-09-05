import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';

export default function Login() {
  const [email, setEmail] = useState('admin@urbanfurniture.com');
  const [password, setPassword] = useState('admin123');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo mode — auto-login based on email prefix
    const role = email.includes('contact') ? ROLES.CONTACT : email.includes('accountant') ? ROLES.INVOICING_USER : ROLES.ADMIN;
    login({ id: 1, name: email.split('@')[0], email, role });
    navigate(role === ROLES.CONTACT ? '/portal' : '/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">UF</div>
          <h1>Urban Furniture</h1>
        </div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
            Sign In
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/auth/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
