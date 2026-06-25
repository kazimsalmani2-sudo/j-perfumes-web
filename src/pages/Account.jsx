import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, LogOut, Trash2, Star, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Account.css';

export default function Account() {
  const [activeTab, setActiveTab] = useState('orders');
  const { user, logout, loggingOut, updateUserProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // Saved addresses and orders state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getStorageKey = () => `saved_addresses_${user?.email || 'guest'}`;

  // Load saved addresses from localStorage
  const loadAddresses = () => {
    try {
      const data = JSON.parse(localStorage.getItem(getStorageKey()) || '[]');
      setSavedAddresses(Array.isArray(data) ? data : []);
    } catch (e) {
      setSavedAddresses([]);
    }
  };

  const getOrderStorageKey = () => `order_history_${user?.email || 'guest'}`;

  // Load order history from localStorage
  const loadOrders = () => {
    try {
      const data = JSON.parse(localStorage.getItem(getOrderStorageKey()) || '[]');
      setOrderHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      setOrderHistory([]);
    }
  };

  useEffect(() => {
    if (!user) return;
    const nameParts = user.displayName ? user.displayName.split(' ') : [];
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || '');
    setEmailAddress(user.email || '');
  }, [user]);

  useEffect(() => {
    loadAddresses();
    loadOrders();
  }, [user]);

  // Reload data when switching tabs
  useEffect(() => {
    if (activeTab === 'address') {
      loadAddresses();
    } else if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const newDisplayName = `${firstName || ''} ${lastName || ''}`.trim();
    setSaveMessage('');

    try {
      await updateUserProfile(newDisplayName);
      setSaveMessage('Your changes have been saved successfully.');
    } catch (error) {
      console.error('Profile update error:', error);
      setSaveMessage('Failed to save. Please try again.');
    }
  };

  const handleDeleteAddress = (id) => {
    const updated = savedAddresses.filter(a => a.id !== id);
    // If we deleted the default, make the first one default
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0].isDefault = true;
    }
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    setSavedAddresses(updated);
  };

  const handleDeleteOrder = (id) => {
    const updated = orderHistory.filter(o => o.id !== id);
    localStorage.setItem(getOrderStorageKey(), JSON.stringify(updated));
    setOrderHistory(updated);
    setSelectedOrder(null);
  };

  const handleSetDefault = (id) => {
    const updated = savedAddresses.map(a => ({ ...a, isDefault: a.id === id }));
    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    setSavedAddresses(updated);
  };

  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Guest');
  const email = user?.email || '';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'G';

  return (
    <main className="account-page">
      <section className="page-hero">
        <div className="container">
          <div className="section-label line-left">
            <span>MY PROFILE</span>
          </div>
          <h1 className="page-hero-title">My Account</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="account-layout">
            {/* Sidebar */}
            <aside className="account-sidebar">
              <div className="profile-summary">
                <div className="profile-avatar">{initials}</div>
                <div>
                  <h4 className="profile-name">{displayName}</h4>
                  <p className="profile-email">{email}</p>
                </div>
              </div>

              <div className="account-tabs">
                <button
                  className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <Package size={16} /> Order History
                </button>
                <button
                  className={`tab-btn ${activeTab === 'address' ? 'active' : ''}`}
                  onClick={() => setActiveTab('address')}
                >
                  <MapPin size={16} /> Saved Addresses
                </button>
                <button
                  className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User size={16} /> Edit Profile
                </button>
                <button
                  className="tab-btn logout-btn"
                  onClick={logout}
                  disabled={loggingOut}
                >
                  <LogOut size={16} /> {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <div className="account-content">
              {activeTab === 'orders' && (
                <div className="orders-tab">
                  <h3 className="tab-title">Order History</h3>
                  {orderHistory.length === 0 ? (
                    <p className="no-items">You haven't placed any orders yet.</p>
                  ) : (
                    <div className="orders-list">
                      {orderHistory.map(order => (
                        <div key={order.id} className="order-row" onClick={() => setSelectedOrder(order)} style={{ cursor: 'pointer' }}>
                          <div className="order-details-col">
                            <span className="order-id">{order.id}</span>
                            <span className="order-date">{order.date}</span>
                          </div>
                          <div className="order-status-col">
                            <span className={`status-badge ${order.status.toLowerCase().replace(/\s/g, '-')}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="order-total-col" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            ₹{order.total.toLocaleString()}
                            <button
                              className="delete-order-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to delete this order from history?')) {
                                  handleDeleteOrder(order.id);
                                }
                              }}
                              title="Delete Order"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'color 0.2s',
                              }}
                              onMouseOver={(e) => e.currentTarget.style.color = '#dc2626'}
                              onMouseOut={(e) => e.currentTarget.style.color = '#ef4444'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'address' && (
                <div className="address-tab">
                  <h3 className="tab-title">Saved Addresses</h3>
                  {savedAddresses.length === 0 ? (
                    <div className="no-items" style={{ textAlign: 'center', padding: '40px 0' }}>
                      <MapPin size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                      <p>No saved addresses yet.</p>
                      <p style={{ fontSize: '13px', opacity: 0.6, marginTop: '6px' }}>
                        Addresses you enter during checkout will appear here automatically.
                      </p>
                    </div>
                  ) : (
                    <div className="address-cards">
                      {savedAddresses.map(addr => (
                        <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                          {addr.isDefault && <span className="default-badge">DEFAULT</span>}
                          <h4 className="address-name">{addr.name}</h4>
                          <p className="address-text">
                            {addr.address}<br />
                            {addr.city}{addr.state ? `, ${addr.state}` : ''} - {addr.pincode}
                          </p>
                          {addr.phone && <p className="address-phone">Phone: {addr.phone}</p>}
                          <div className="address-actions" style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                            {!addr.isDefault && (
                              <button
                                className="btn-address-action"
                                onClick={() => handleSetDefault(addr.id)}
                                title="Set as default"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '5px',
                                  background: 'transparent', border: '1px solid var(--gold)',
                                  color: 'var(--gold)', padding: '5px 12px', borderRadius: '4px',
                                  cursor: 'pointer', fontSize: '12px'
                                }}
                              >
                                <Star size={13} /> Set Default
                              </button>
                            )}
                            <button
                              className="btn-address-action"
                              onClick={() => handleDeleteAddress(addr.id)}
                              title="Delete address"
                              style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                background: 'transparent', border: '1px solid #e74c3c',
                                color: '#e74c3c', padding: '5px 12px', borderRadius: '4px',
                                cursor: 'pointer', fontSize: '12px'
                              }}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="profile-tab">
                  <h3 className="tab-title">Profile Settings</h3>
                  <form className="profile-form" onSubmit={handleSaveChanges}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={e => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={e => setEmailAddress(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-gold">
                      SAVE CHANGES
                    </button>
                    {saveMessage && (
                      <p style={{ marginTop: '16px', color: '#0f766e', fontSize: '14px' }}>
                        {saveMessage}
                      </p>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedOrder(null)} aria-label="Close modal">
              <X size={20} />
            </button>
            <div className="modal-header">
              <h2 className="modal-order-id">{selectedOrder.id}</h2>
              <p className="modal-order-date">Placed on {selectedOrder.date}</p>
            </div>
            <div className="modal-body">
              <div className="modal-col-left">
                <h4 className="modal-section-title">DELIVERY DETAILS</h4>
                <div className="details-group">
                  <p><strong>Name:</strong> {selectedOrder.deliveryDetails?.name || displayName}</p>
                  <p><strong>Phone:</strong> {selectedOrder.deliveryDetails?.phone || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedOrder.deliveryDetails?.email || email}</p>
                  <p className="modal-address">
                    <strong>Address:</strong><br />
                    {selectedOrder.deliveryDetails?.address || 'N/A'}<br />
                    {selectedOrder.deliveryDetails?.city ? `${selectedOrder.deliveryDetails.city}` : ''}
                    {selectedOrder.deliveryDetails?.state ? `, ${selectedOrder.deliveryDetails.state}` : ''}
                    {selectedOrder.deliveryDetails?.pincode ? ` - ${selectedOrder.deliveryDetails.pincode}` : ''}
                  </p>
                  <p><strong>Payment Method:</strong><br />{selectedOrder.method || 'N/A'}</p>
                  <div className="modal-status-wrapper">
                    <strong>Status:</strong>{' '}
                    <span className={`status-badge ${(selectedOrder.status || 'Processing').toLowerCase().replace(/\s/g, '-')}`}>
                      {selectedOrder.status || 'Processing'}
                    </span>
                  </div>
                  <button
                    className="modal-delete-btn"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this order from history?')) {
                        handleDeleteOrder(selectedOrder.id);
                      }
                    }}
                    style={{
                      marginTop: '25px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: 'transparent',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      padding: '10px 20px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      width: 'fit-content'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                  >
                    <Trash2 size={14} /> DELETE ORDER
                  </button>
                </div>
              </div>
              <div className="modal-col-right">
                <h4 className="modal-section-title">ITEMS ORDERED</h4>
                <div className="modal-items-list">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="modal-item-row-with-img">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="modal-item-img"
                          />
                        )}
                        <div className="modal-item-info">
                          <span className="modal-item-name-qty">
                            {item.name}
                            {item.size ? <span className="modal-item-size"> ({item.size}ml)</span> : ''}
                          </span>
                          <span className="modal-item-qty-label">Qty: {item.quantity}</span>
                        </div>
                        <span className="modal-item-price">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="modal-item-row">
                      <span className="modal-item-name-qty">
                        Order Items <span className="modal-item-qty">× 1</span>
                      </span>
                      <span className="modal-item-price">
                        ₹{(selectedOrder.total || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="modal-price-summary">
                  <div className="modal-summary-row">
                    <span>Subtotal</span>
                    <span>₹{(selectedOrder.subtotal || selectedOrder.total || 0).toLocaleString()}</span>
                  </div>
                  <div className="modal-summary-row">
                    <span>Shipping</span>
                    <span>{selectedOrder.shipping === 0 ? 'FREE' : selectedOrder.shipping ? `₹${selectedOrder.shipping}` : 'FREE'}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="modal-summary-row discount">
                      <span>Discount</span>
                      <span>-₹{selectedOrder.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="modal-summary-divider" />
                  <div className="modal-summary-row total-row">
                    <span>Total</span>
                    <span>₹{(selectedOrder.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
