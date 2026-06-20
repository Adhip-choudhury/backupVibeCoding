import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LogIn, Fingerprint, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login, loginWithPasskey } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await login(username, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handlePasskey = async () => {
    setError('');
    setPasskeyLoading(true);
    const err = await loginWithPasskey();
    setPasskeyLoading(false);
    if (err) {
      setError(err);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="10" fill="#f97316" />
              <circle cx="24" cy="24" r="8" stroke="white" strokeWidth="2.5" />
              <path d="M24 10v4M24 34v4M10 24h4M34 24h4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M15.76 15.76l2.83 2.83M29.41 29.41l2.83 2.83M15.76 32.24l2.83-2.83M29.41 18.59l2.83-2.83" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <h1>ShopFloor</h1>
          </div>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            <LogIn size={16} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button className="btn btn-secondary auth-btn" onClick={handlePasskey} disabled={passkeyLoading}>
          <Fingerprint size={16} />
          {passkeyLoading ? 'Waiting for passkey...' : 'Sign in with Passkey'}
        </button>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
