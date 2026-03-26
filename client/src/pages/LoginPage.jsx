import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <span className="login-brand-icon">🛒</span>
          <span className="login-brand-name">SmartShop</span>
        </div>

        <h1 className="login-title">Admin Sign In</h1>
        <p className="login-sub">Enter your credentials to manage the store.</p>

        {error && (
          <div className="login-error" role="alert">
            ⚠️ {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              autoFocus
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="pw-wrapper">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw(p => !p)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading || !username || !password}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p className="login-back">
          <a href="/">← Back to Storefront</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
