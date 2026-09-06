import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api';
import BackgroundVideo from '../../components/BackgroundVideo';
import LoadingScreen from '../../components/LoadingScreen';
import Logo from '../../components/Logo';

const AUTH_TRANSITION_MS = 550;

export default function SignUp() {
  const [form, setForm] = useState({ name: '', loginId: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcomeName, setWelcomeName] = useState(null);
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
      setWelcomeName(user.name || 'aboard');
      setTimeout(() => {
        navigate('/');
      }, AUTH_TRANSITION_MS);
    } catch (err) {
      setError(err.message || 'Sign up failed');
      setLoading(false);
    }
  };

  if (welcomeName) {
    return <LoadingScreen label={`Welcome, ${welcomeName}`} />;
  }

  return (
    <div className="auth-page">
      <BackgroundVideo />
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="auth-logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Logo className="logo-icon" size={48} />
          <h1>Cabin8</h1>
        </motion.div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join the Cabin8 ERP platform as an Accountant</p>
        <AnimatePresence>
          {error && (
            <motion.div
              className="form-error"
              role="alert"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 'var(--space-4)' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
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
          <motion.button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.015 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </motion.button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/auth/login">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
}
