import { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLayout from './AdminLayout';
import { Search, ChevronDown, ChevronUp, RefreshCw, Trash2, Eye, FileSpreadsheet, X, Mail, Phone, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import './AdminLayout.css';
import './AdminOrders.css';

const ORDER_STATUSES = ['all', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const { adminFetch } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Modal detail states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await adminFetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [adminFetch, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateOrderStatus = async (orderId, orderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await adminFetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ orderStatus }),
      });
      const updated = await res.json();
      
      // Update in state lists
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, orderStatus: updated.orderStatus } : o));
      
      // Update in active modal if open
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: updated.orderStatus }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await adminFetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentStatus }),
      });
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, paymentStatus: updated.paymentStatus } : o));
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(prev => ({ ...prev, paymentStatus: updated.paymentStatus }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm(`Delete order #${orderId}? This cannot be undone.`)) return;
    try {
      await adminFetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      setOrders(prev => prev.filter(o => o.orderId !== orderId));
      setTotal(t => t - 1);
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setShowDetailModal(false);
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const filtered = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.orderId?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Phone', 'Address', 'City', 'State', 'Pincode', 'Subtotal', 'Shipping', 'Discount', 'Total Amount', 'Payment Method', 'Payment Status', 'Order Status', 'Date'];
    
    const rows = filtered.map(o => [
      o.orderId,
      `"${(o.customer?.name || '').replace(/"/g, '""')}"`,
      o.customer?.email,
      `"${o.customer?.phone || ''}"`,
      `"${(o.customer?.address || '').replace(/"/g, '""')}"`,
      `"${(o.customer?.city || '').replace(/"/g, '""')}"`,
      `"${(o.customer?.state || '').replace(/"/g, '""')}"`,
      o.customer?.pincode,
      o.subtotal,
      o.shipping,
      o.discountAmount,
      o.total,
      o.paymentMethod?.toUpperCase(),
      o.paymentStatus,
      o.orderStatus,
      new Date(o.createdAt).toLocaleString('en-IN')
    ]);
    
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `j_perfumewala_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-subtitle">{filtered.length} order{filtered.length !== 1 ? 's' : ''} shown (out of {total})</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-admin-ghost" onClick={handleExportCSV}>
            <FileSpreadsheet size={14} /> Export CSV
          </button>
          <button className="btn-admin-ghost" onClick={fetchOrders}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={14} />
          <input
            className="admin-search"
            placeholder="Search by ID, name, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="admin-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>
          ))}
        </select>
      </div>

      <div className="orders-table-wrap" style={{ margin: '24px 32px 0' }}>
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            <span>Loading orders…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-card">
            <div className="admin-empty">
              <div className="admin-empty-icon">📦</div>
              <h3>No orders found</h3>
              <p>Try clearing your search query or filters.</p>
            </div>
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items Count</th>
                  <th>Total Price</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order._id}>
                    <td>
                      <span style={{ color: '#b8960c', fontWeight: 600 }}>#{order.orderId}</span>
                    </td>
                    <td>
                      <div className="customer-name">{order.customer?.name}</div>
                      <div className="customer-email">{order.customer?.email}</div>
                    </td>
                    <td>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                    <td className="amount-cell">₹{order.total?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`status-badge ${order.paymentStatus}`}>
                        {order.paymentStatus}
                      </span>
                      <span style={{ display: 'block', fontSize: 10, color: '#6b7280', textTransform: 'uppercase', marginTop: 3 }}>
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${order.orderStatus?.toLowerCase()}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-admin-ghost icon-btn" onClick={() => openDetails(order)} title="View Detail Modal">
                          <Eye size={13} />
                        </button>
                        <button className="btn-admin-danger icon-btn" onClick={() => deleteOrder(order.orderId)} title="Delete Order">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="order-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details — #{selectedOrder.orderId}</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-content">
              {/* Order Status Ribbon */}
              <div className="status-ribbon">
                <div className="ribbon-item">
                  <span className="ribbon-label">Order Status:</span>
                  <select
                    className="admin-select ribbon-select"
                    value={selectedOrder.orderStatus}
                    onChange={e => updateOrderStatus(selectedOrder.orderId, e.target.value)}
                    disabled={updatingId === selectedOrder.orderId}
                  >
                    {['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="ribbon-item">
                  <span className="ribbon-label">Payment Status:</span>
                  <select
                    className="admin-select ribbon-select"
                    value={selectedOrder.paymentStatus}
                    onChange={e => updatePaymentStatus(selectedOrder.orderId, e.target.value)}
                    disabled={updatingId === selectedOrder.orderId}
                  >
                    {['pending', 'paid', 'failed', 'refunded'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-detail-grid">
                {/* Left Side: Customer & Shipping */}
                <div className="detail-panel">
                  <div className="panel-section">
                    <h3 className="section-subtitle-modal"><Users size={14} /> Customer Profile</h3>
                    <div className="info-block">
                      <div className="info-item">
                        <span className="info-label">Name</span>
                        <span className="info-val">{selectedOrder.customer?.name}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label"><Mail size={12} /> Email</span>
                        <span className="info-val"><a href={`mailto:${selectedOrder.customer?.email}`} className="email-link">{selectedOrder.customer?.email}</a></span>
                      </div>
                      <div className="info-item">
                        <span className="info-label"><Phone size={12} /> Phone</span>
                        <span className="info-val">{selectedOrder.customer?.phone || 'Not Provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="panel-section">
                    <h3 className="section-subtitle-modal"><MapPin size={14} /> Shipping Destination</h3>
                    <div className="info-block">
                      <div className="info-item">
                        <span className="info-label">Street Address</span>
                        <span className="info-val address-block">{selectedOrder.customer?.address}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">City, State</span>
                        <span className="info-val">{selectedOrder.customer?.city}, {selectedOrder.customer?.state}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Pincode</span>
                        <span className="info-val">{selectedOrder.customer?.pincode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="panel-section">
                    <h3 className="section-subtitle-modal"><CreditCard size={14} /> Payment Details</h3>
                    <div className="info-block">
                      <div className="info-item">
                        <span className="info-label">Method</span>
                        <span className="info-val" style={{ textTransform: 'uppercase' }}>{selectedOrder.paymentMethod}</span>
                      </div>
                      {selectedOrder.razorpayOrderId && (
                        <div className="info-item">
                          <span className="info-label">Razorpay Order</span>
                          <span className="info-val font-mono">{selectedOrder.razorpayOrderId}</span>
                        </div>
                      )}
                      {selectedOrder.razorpayPaymentId && (
                        <div className="info-item">
                          <span className="info-label">Payment ID</span>
                          <span className="info-val font-mono">{selectedOrder.razorpayPaymentId}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <span className="info-label">Placed At</span>
                        <span className="info-val">{new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Items & Financial Breakdown */}
                <div className="detail-panel">
                  <div className="panel-section">
                    <h3 className="section-subtitle-modal"><ShoppingBag size={14} /> Ordered Items</h3>
                    <div className="ordered-items-box">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="modal-item-row">
                          <div className="modal-item-img">
                            {item.image ? (
                              <img src={item.image.startsWith('http') ? item.image : `http://localhost:5173${item.image}`} alt={item.name} onError={e => e.target.style.display='none'} />
                            ) : (
                              <div className="modal-item-img-placeholder">💎</div>
                            )}
                          </div>
                          <div className="modal-item-info">
                            <div className="modal-item-name">{item.name}</div>
                            <div className="modal-item-specs">{item.ml ? `${item.ml}ml` : ''} · Qty: {item.quantity} · ₹{item.price?.toLocaleString()} each</div>
                          </div>
                          <div className="modal-item-total">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel-section">
                    <div className="price-breakdown">
                      <div className="breakdown-row">
                        <span>Subtotal</span>
                        <span>₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</span>
                      </div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="breakdown-row discount">
                          <span>Discount Applied</span>
                          <span>-₹{selectedOrder.discountAmount?.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="breakdown-row">
                        <span>Shipping Rate</span>
                        <span>{selectedOrder.shipping === 0 ? 'Free' : `₹${selectedOrder.shipping}`}</span>
                      </div>
                      <div className="breakdown-row grand-total">
                        <span>Total Paid</span>
                        <span>₹{selectedOrder.total?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-admin-danger" onClick={() => deleteOrder(selectedOrder.orderId)} style={{ marginRight: 'auto' }}>
                Delete Order
              </button>
              <button className="btn-admin-ghost" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
