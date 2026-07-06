import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { FlaskConical, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import './AdminLogin.css';

export default function AdminLogin() {
  const { adminLogin, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await adminLogin(form.email, form.password);
    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.error || 'Login failed. Check your credentials.');
    }
  };

  return (
    <div className="admin-login-page">
      {/* Decorative background */}
      <div className="login-bg-orb login-bg-orb1" />
      <div className="login-bg-orb login-bg-orb2" />

      <div className="admin-login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <FlaskConical size={28} />
          </div>
          <div>
            <div className="login-brand">J Perfumewala</div>
            <div className="login-panel-label">Admin Panel</div>
          </div>
        </div>

        <h1 className="login-heading">Welcome back</h1>
        <p className="login-subtext">Sign in to manage your store</p>

        {error && (
          <div className="login-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="admin-email">Email</label>
            <div className="login-input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                id="admin-email"
                type="email"
                placeholder="admin@jperfumewala.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="admin-password">Password</label>
            <div className="login-input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="admin-password"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter admin password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              'Sign In to Admin Panel'
            )}
          </button>
        </form>

        <div className="login-hint">
          <Lock size={12} /> Restricted access — authorised personnel only
        </div>
      </div>
    </div>
  );
}
