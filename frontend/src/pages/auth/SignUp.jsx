import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api';
import BackgroundVideo from '../../components/BackgroundVideo';

export default function SignUp() {
  const [form, setForm] = useState({ name: '', loginId: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.signup(form);
      const { token, user } = await authApi.login(form.loginId, form.password);
      login(user, token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <BackgroundVideo />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">C8</div>
          <h1>Cabin8</h1>
        </div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join the Cabin8 ERP platform as an Accountant</p>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Login Id <span style={{ fontWeight: 400 }}>(6-12 characters)</span></label>
            <input type="text" className="form-input" minLength={6} maxLength={12} value={form.loginId} onChange={e => setForm(f => ({ ...f, loginId: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password <span style={{ fontWeight: 400 }}>(upper, lower, special char, 8+)</span></label>
            <input type="password" className="form-input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-2)' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/auth/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
