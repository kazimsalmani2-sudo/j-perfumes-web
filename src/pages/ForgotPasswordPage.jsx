import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('A password reset link has been sent to your email address.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send password reset email.');
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
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '400', fontSize: '24px' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Enter your email and we'll send you a link to reset your password.
          </p>
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

        {message && (
          <div style={{
            background: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #bbf7d0',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

          <button
            type="submit"
            disabled={loading}
            className="btn btn-gold btn-full"
            style={{ padding: '14px', fontSize: '13px', letterSpacing: '1px' }}
          >
            {loading ? 'SENDING LINK...' : 'SEND RESET LINK'}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Back to{' '}
          <Link to="/login" style={{ color: 'var(--gold-dark)', fontWeight: '600', textDecoration: 'underline' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
