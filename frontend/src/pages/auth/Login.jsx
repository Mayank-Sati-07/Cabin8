import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api';
import { ROLES } from '../../constants/roles';
import BackgroundVideo from '../../components/BackgroundVideo';
import LoadingScreen from '../../components/LoadingScreen';
import Logo from '../../components/Logo';

const AUTH_TRANSITION_MS = 550;

export default function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const { token, user } = await authApi.login(loginId, password);
      login(user, token);
      setWelcomeName(user.name || 'back');
      setTimeout(() => {
        navigate(user.role === ROLES.USER ? '/portal' : '/');
      }, AUTH_TRANSITION_MS);
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  if (welcomeName) {
    return <LoadingScreen label={`Welcome back, ${welcomeName}`} />;
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
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>
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
            <label className="form-label">Login Id</label>
            <input type="text" className="form-input" value={loginId} onChange={e => setLoginId(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <motion.button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.015 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/auth/signup">Sign Up</Link>
        </div>
      </motion.div>
    </div>
  );
}
