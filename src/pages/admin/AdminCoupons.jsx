import { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLayout from './AdminLayout';
import { Plus, Search, Trash2, RefreshCw, X, Gift, Calendar, DollarSign, Percent, AlertCircle, Edit, Check, XSquare, Ticket } from 'lucide-react';
import './AdminLayout.css';
import './AdminCoupons.css';
import './AdminProducts.css';

const EMPTY_COUPON_FORM = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '0',
  expiryDate: '',
  usageLimit: '',
  limitPerCustomer: '',
  isActive: true
};

export default function AdminCoupons() {
  const { adminFetch } = useAdminAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_COUPON_FORM);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [editId, setEditId] = useState(null); // null when adding

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/coupons');
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_COUPON_FORM);
    setModalError('');
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditId(coupon._id);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || 0,
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit !== null && coupon.usageLimit !== undefined ? coupon.usageLimit : '',
      limitPerCustomer: coupon.limitPerCustomer !== null && coupon.limitPerCustomer !== undefined ? coupon.limitPerCustomer : '',
      isActive: coupon.isActive
    });
    setModalError('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError('');
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount || 0),
        expiryDate: new Date(form.expiryDate),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        limitPerCustomer: form.limitPerCustomer ? Number(form.limitPerCustomer) : null,
        isActive: form.isActive
      };

      if (!payload.code) throw new Error('Code is required');
      if (isNaN(payload.discountValue) || payload.discountValue <= 0) throw new Error('Discount value must be greater than zero');
      if (payload.discountType === 'percentage' && payload.discountValue > 100) throw new Error('Percentage discount cannot exceed 100%');
      if (!form.expiryDate) throw new Error('Expiry date is required');

      let res;
      if (editId) {
        res = await adminFetch(`/api/coupons/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await adminFetch('/api/coupons', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save coupon');

      await fetchCoupons();
      setShowModal(false);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (coupon) => {
    try {
      const res = await adminFetch(`/api/coupons/${coupon._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !coupon.isActive })
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await adminFetch(`/api/coupons/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete coupon');
      setCoupons(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Coupons & Promo Codes</h1>
          <p className="admin-page-subtitle">Configure e-commerce discount codes, limits, and values</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-admin-ghost" onClick={fetchCoupons}><RefreshCw size={14} /> Refresh</button>
          <button className="btn-admin-primary" onClick={openAdd}><Plus size={16} /> Create Coupon</button>
        </div>
      </div>

      <div className="coupons-wrap" style={{ padding: '24px 32px 0' }}>
        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /><span>Loading coupons…</span></div>
        ) : coupons.length === 0 ? (
          <div className="admin-card">
            <div className="admin-empty">
              <div className="admin-empty-icon" style={{ marginBottom: 12 }}>
                <Ticket size={40} className="text-gold" style={{ opacity: 0.6 }} />
              </div>
              <h3>No coupons configured</h3>
              <p>Create a promo code (e.g. WELCOME10) to offer custom discounts at checkout.</p>
            </div>
          </div>
        ) : (
          <div className="admin-card">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount Details</th>
                    <th>Minimum Spend</th>
                    <th>Claims / Limit</th>
                    <th>Expiry Date</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(coupon => {
                    const expired = new Date() > new Date(coupon.expiryDate);
                    return (
                      <tr key={coupon._id}>
                        <td>
                          <div className="coupon-code-badge">{coupon.code}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                            {coupon.discountType === 'percentage' ? (
                              <><Percent size={14} className="text-gold" /> {coupon.discountValue}% Off</>
                            ) : (
                              <>₹{coupon.discountValue} Off</>
                            )}
                          </div>
                        </td>
                        <td style={{ color: '#d1d5db' }}>
                          {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount.toLocaleString()}` : 'No Min Limit'}
                        </td>
                        <td style={{ color: '#9ca3af', fontSize: 13 }}>
                          {coupon.usedCount || 0} / {coupon.usageLimit || '∞'} ({coupon.limitPerCustomer ? `${coupon.limitPerCustomer}/user` : '∞/user'})
                        </td>
                        <td>
                          <span style={{ color: expired ? '#f87171' : '#9ca3af', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Calendar size={13} />
                            {new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                            {expired && ' (Expired)'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className={`coupon-status-toggle ${coupon.isActive ? 'active' : 'inactive'}`}
                            onClick={() => toggleStatus(coupon)}
                            title={coupon.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
                          >
                            {coupon.isActive ? <Check size={14} /> : <X size={14} />}
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-admin-ghost icon-btn" onClick={() => openEdit(coupon)} title="Edit Coupon">
                              <Edit size={13} />
                            </button>
                            <button 
                              className="btn-admin-danger icon-btn" 
                              onClick={() => handleDelete(coupon._id)}
                              disabled={deletingId === coupon._id}
                              title="Delete Coupon"
                            >
                              {deletingId === coupon._id ? (
                                <span className="admin-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />
                              ) : <Trash2 size={13} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Coupon Editor Modal */}
      {showModal && (
        <div className="product-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="product-modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Promo Coupon' : 'Create New Coupon'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="product-form" style={{ padding: 24 }}>
              {modalError && (
                <div className="modal-error"><AlertCircle size={14} />{modalError}</div>
              )}

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Promo Code *</label>
                <input 
                  name="code" 
                  value={form.code} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. FESTIVE20"
                  style={{ textTransform: 'uppercase' }}
                  disabled={!!editId}
                  autoComplete="off"
                />
              </div>

              <div className="form-row" style={{ marginBottom: 14 }}>
                <div className="form-group">
                  <label>Type *</label>
                  <select name="discountType" value={form.discountType} onChange={handleChange}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Price (₹)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Discount Value *</label>
                  <input 
                    name="discountValue" 
                    type="number" 
                    value={form.discountValue} 
                    onChange={handleChange} 
                    required 
                    min={0}
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: 14 }}>
                <div className="form-group">
                  <label>Min Order Total (₹)</label>
                  <input 
                    name="minOrderAmount" 
                    type="number" 
                    value={form.minOrderAmount} 
                    onChange={handleChange} 
                    min={0}
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input 
                    name="expiryDate" 
                    type="date" 
                    value={form.expiryDate} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: 14 }}>
                <div className="form-group">
                  <label>Usage Limit (Global Claims)</label>
                  <input 
                    name="usageLimit" 
                    type="number" 
                    value={form.usageLimit} 
                    onChange={handleChange} 
                    placeholder="Unlimited"
                    min={1}
                  />
                </div>

                <div className="form-group">
                  <label>Limit Per Customer</label>
                  <input 
                    name="limitPerCustomer" 
                    type="number" 
                    value={form.limitPerCustomer} 
                    onChange={handleChange} 
                    placeholder="Unlimited"
                    min={1}
                  />
                </div>
              </div>

              <div className="form-row checkboxes" style={{ margin: '10px 0 0 0' }}>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="isActive" 
                    checked={form.isActive} 
                    onChange={handleChange} 
                  />
                  Active (Allow clients to apply coupon code)
                </label>
              </div>

              <div className="modal-footer" style={{ marginTop: 24, padding: 0, border: 'none' }}>
                <button type="button" className="btn-admin-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>
                  {saving ? <div className="admin-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : (editId ? 'Save Changes' : 'Create Coupon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
