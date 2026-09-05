import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api';
import { ROLES } from '../../constants/roles';
import BackgroundVideo from '../../components/BackgroundVideo';

export default function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await authApi.login(loginId, password);
      login(user, token);
      navigate(user.role === ROLES.USER ? '/portal' : '/');
    } catch (err) {
      setError(err.message || 'Login failed');
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
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Login Id</label>
            <input type="text" className="form-input" value={loginId} onChange={e => setLoginId(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-2)' }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/auth/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
