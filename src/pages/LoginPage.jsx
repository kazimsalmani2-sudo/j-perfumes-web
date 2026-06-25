import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      sessionStorage.removeItem("guestMode"); // Clear guest mode if logged in successfully
      navigate(location.state?.from?.pathname || "/home", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--off-white)',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-light)',
        borderTop: '3px solid var(--gold)',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        borderRadius: '4px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/logo.jpg" alt="Logo" style={{ height: '60px', marginBottom: '15px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '400', fontSize: '24px' }}>Sign In</h2>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#ef4444',
            border: '1px solid #fee2e2',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={{
                padding: '12px',
                border: '1px solid var(--border-light)',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
                background: 'var(--off-white)'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--gold-dark)', textDecoration: 'underline' }}>Forgot Password?</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'var(--off-white)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--gold-dark)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-gold btn-full"
            style={{ padding: '14px', fontSize: '13px', letterSpacing: '1px' }}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" state={{ from: location.state?.from }} style={{ color: 'var(--gold-dark)', fontWeight: '600', textDecoration: 'underline' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
