import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { UserPlus, Fingerprint, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const { signup, registerPasskey } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usePasskey, setUsePasskey] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (usePasskey) {
      setPasskeyLoading(true);
      const err = await registerPasskey(username);
      setPasskeyLoading(false);
      if (err) {
        setError(err);
      } else {
        navigate('/', { replace: true });
      }
      return;
    }

    setLoading(true);
    const err = await signup(username, password);
    setLoading(false);
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
          <p className="auth-subtitle">Create your account</p>
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
              placeholder="Choose a username"
              required
              autoFocus
            />
          </div>

          {!usePasskey && (
            <>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a password"
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

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </>
          )}

          <div className="auth-passkey-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={usePasskey}
                onChange={e => setUsePasskey(e.target.checked)}
              />
              <span className="toggle-check" />
              Use passkey instead (fingerprint / Face ID)
            </label>
          </div>

          {usePasskey ? (
            <button type="submit" className="btn btn-primary auth-btn" disabled={passkeyLoading}>
              <Fingerprint size={16} />
              {passkeyLoading ? 'Creating passkey...' : 'Create with Passkey'}
            </button>
          ) : (
            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              <UserPlus size={16} />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          )}
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
