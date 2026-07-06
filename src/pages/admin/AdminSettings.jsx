import { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLayout from './AdminLayout';
import { Save, RefreshCw, Settings, Info, CreditCard, Ship, Landmark, HelpCircle, CheckCircle } from 'lucide-react';
import './AdminLayout.css';
import './AdminSettings.css';

export default function AdminSettings() {
  const { adminFetch } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Store Settings fields
  const [form, setForm] = useState({
    storeName: '',
    storeLogo: '',
    contactEmail: '',
    contactPhone: '',
    currency: 'INR',
    currencySymbol: '₹',
    shippingRate: 0,
    freeShippingThreshold: 0,
    taxRate: 0,
    taxInclusivePricing: true
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/settings');
      const data = await res.json();
      setForm({
        storeName: data.storeName || '',
        storeLogo: data.storeLogo || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        currency: data.currency || 'INR',
        currencySymbol: data.currencySymbol || '₹',
        shippingRate: data.shippingRate || 0,
        freeShippingThreshold: data.freeShippingThreshold || 0,
        taxRate: data.taxRate || 0,
        taxInclusivePricing: data.taxInclusivePricing !== undefined ? data.taxInclusivePricing : true
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      const payload = {
        ...form,
        shippingRate: Number(form.shippingRate),
        freeShippingThreshold: Number(form.freeShippingThreshold),
        taxRate: Number(form.taxRate),
        taxInclusivePricing: Boolean(form.taxInclusivePricing)
      };

      const res = await adminFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save settings configurations.');
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Store Configuration Settings</h1>
          <p className="admin-page-subtitle">Manage global storefront data, contact details, delivery parameters, and tax metrics</p>
        </div>
        <button className="btn-admin-ghost" onClick={fetchSettings}><RefreshCw size={14} /> Reset Form</button>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /><span>Loading settings data…</span></div>
      ) : (
        <div className="settings-body-panel">
          <form onSubmit={handleSubmit} className="settings-form">
            
            {success && (
              <div className="settings-alert-success">
                <CheckCircle size={16} /> <span>Store settings updated successfully! Changes are applied across the store.</span>
              </div>
            )}
            {error && (
              <div className="settings-alert-error">
                <Info size={16} /> <span>Error saving configuration: {error}</span>
              </div>
            )}

            <div className="settings-grid-blocks">
              {/* Section 1: General Info */}
              <div className="admin-card settings-card-block">
                <div className="card-header">
                  <h3><Settings size={15} /> General Store Parameters</h3>
                </div>
                <div className="settings-card-body">
                  <div className="form-group">
                    <label>Store Display Name *</label>
                    <input 
                      name="storeName" 
                      value={form.storeName} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Store Logo Asset URL</label>
                    <input 
                      name="storeLogo" 
                      value={form.storeLogo} 
                      onChange={handleChange} 
                    />
                    <span className="settings-input-hint">Path to static logo or full image URL (e.g. /logo.jpg)</span>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Contact Email Address *</label>
                      <input 
                        name="contactEmail" 
                        type="email"
                        value={form.contactEmail} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Phone Number</label>
                      <input 
                        name="contactPhone" 
                        value={form.contactPhone} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Shipping Rates & Currencies */}
              <div className="admin-card settings-card-block">
                <div className="card-header">
                  <h3><Ship size={15} /> Shipping & Currency Options</h3>
                </div>
                <div className="settings-card-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Default Currency Code</label>
                      <select name="currency" value={form.currency} onChange={handleChange}>
                        <option value="INR">INR (Indian Rupee)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="GBP">GBP (British Pound)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Currency Symbol</label>
                      <input 
                        name="currencySymbol" 
                        value={form.currencySymbol} 
                        onChange={handleChange} 
                        maxLength={3}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Standard Shipping Rate (₹) *</label>
                      <input 
                        name="shippingRate" 
                        type="number"
                        value={form.shippingRate} 
                        onChange={handleChange} 
                        required 
                        min={0}
                      />
                    </div>
                    <div className="form-group">
                      <label>Free Shipping Threshold (₹)</label>
                      <input 
                        name="freeShippingThreshold" 
                        type="number"
                        value={form.freeShippingThreshold} 
                        onChange={handleChange} 
                        required 
                        min={0}
                      />
                    </div>
                  </div>
                  <span className="settings-input-hint">Set Standard rate to 0 to make all deliveries free by default.</span>
                </div>
              </div>

              {/* Section 3: Tax configurations */}
              <div className="admin-card settings-card-block">
                <div className="card-header">
                  <h3><Landmark size={15} /> Tax & Compliance</h3>
                </div>
                <div className="settings-card-body">
                  <div className="form-group" style={{ maxWidth: '50%' }}>
                    <label>Estimated Sales Tax Rate (%)</label>
                    <div className="tax-input-wrapper">
                      <input 
                        name="taxRate" 
                        type="number"
                        value={form.taxRate} 
                        onChange={handleChange} 
                        required 
                        min={0}
                        max={100}
                        step={0.1}
                      />
                      <span className="tax-suffix-percent">%</span>
                    </div>
                    <span className="settings-input-hint">Tax percentage added to subtotal for GST invoice calculation (e.g. 18.0%).</span>
                  </div>

                  <div className="form-group" style={{ maxWidth: '50%', marginTop: '14px' }}>
                    <label>Tax Pricing Model</label>
                    <select 
                      name="taxInclusivePricing"
                      value={form.taxInclusivePricing ? 'true' : 'false'}
                      onChange={e => setForm(prev => ({ ...prev, taxInclusivePricing: e.target.value === 'true' }))}
                      className="admin-select"
                    >
                      <option value="true">Tax-Inclusive Pricing (Display prices already include tax)</option>
                      <option value="false">Tax-Exclusive Pricing (Tax is calculated and added at checkout)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-action-bar">
              <button type="submit" className="btn-admin-primary settings-save-btn" disabled={saving}>
                <Save size={15} />
                {saving ? 'Saving changes…' : 'Save Config parameters'}
              </button>
            </div>

          </form>
        </div>
      )}
    </AdminLayout>
  );
}
