import { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLayout from './AdminLayout';
import { Search, RefreshCw, CheckCircle, XCircle, User, Eye, X, Calendar, ShoppingBag, CreditCard } from 'lucide-react';
import './AdminLayout.css';
import './AdminUsers.css';

export default function AdminUsers() {
  const { adminFetch } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Customer Detail History States
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const viewCustomerHistory = async (user) => {
    setSelectedUser(user);
    setLoadingOrders(true);
    setShowHistoryModal(true);
    try {
      const res = await adminFetch(`/api/admin/users/${user.email}/orders`);
      const data = await res.json();
      setUserOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers</h1>
          <p className="admin-page-subtitle">{filtered.length} registered customer{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-admin-ghost" onClick={fetchUsers}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={14} />
          <input
            className="admin-search"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="users-wrap" style={{ margin: '24px 32px 0' }}>
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            <span>Loading customers…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-card">
            <div className="admin-empty">
              <div className="admin-empty-icon">👤</div>
              <h3>No customers found</h3>
              <p>Customers who register on your store will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="admin-card">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email Address</th>
                    <th>Total Orders</th>
                    <th>Total Spent</th>
                    <th>Last Order Date</th>
                    <th>Verified Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {user.name?.charAt(0).toUpperCase() || <User size={14} />}
                          </div>
                          <div className="user-name">{user.name}</div>
                        </div>
                      </td>
                      <td style={{ color: '#9ca3af', fontSize: 13 }}>{user.email}</td>
                      <td style={{ fontWeight: 600, color: '#e5e7eb' }}>{user.totalOrders} order{user.totalOrders !== 1 ? 's' : ''}</td>
                      <td style={{ fontWeight: 700, color: '#f0e6c8' }}>₹{user.totalSpent?.toLocaleString('en-IN')}</td>
                      <td style={{ color: '#9ca3af', fontSize: 12.5 }}>
                        {user.lastOrderDate ? (
                          new Date(user.lastOrderDate).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })
                        ) : '—'}
                      </td>
                      <td>
                        {user.isVerified ? (
                          <span className="status-badge delivered">
                            <CheckCircle size={11} /> Verified
                          </span>
                        ) : (
                          <span className="status-badge cancelled">
                            <XCircle size={11} /> Unverified
                          </span>
                        )}
                      </td>
                      <td>
                        <button className="btn-admin-ghost icon-btn" onClick={() => viewCustomerHistory(user)} title="View Order History">
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Customer Purchase History Modal */}
      {showHistoryModal && selectedUser && (
        <div className="history-modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="history-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Purchase History — {selectedUser.name}</h2>
              <button className="modal-close" onClick={() => setShowHistoryModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="history-modal-body">
              <div className="customer-summary-ribbon">
                <div className="ribbon-summary-item">
                  <span className="ribbon-summary-label">Total Spend</span>
                  <span className="ribbon-summary-val">₹{selectedUser.totalSpent?.toLocaleString('en-IN')}</span>
                </div>
                <div className="ribbon-summary-item">
                  <span className="ribbon-summary-label">Orders Placed</span>
                  <span className="ribbon-summary-val">{selectedUser.totalOrders}</span>
                </div>
                <div className="ribbon-summary-item">
                  <span className="ribbon-summary-label">Member Since</span>
                  <span className="ribbon-summary-val">
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="history-orders-container">
                <h3 className="history-title-header"><ShoppingBag size={14} /> Full Orders List</h3>
                {loadingOrders ? (
                  <div className="admin-loading">
                    <div className="admin-spinner" />
                    <span>Loading purchase history…</span>
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="admin-empty">
                    <p>No orders placed by this customer yet.</p>
                  </div>
                ) : (
                  <div className="history-orders-list">
                    {userOrders.map(order => (
                      <div key={order._id} className="history-order-row">
                        <div className="history-order-meta">
                          <div className="order-num-id">Order ID: <strong>#{order.orderId}</strong></div>
                          <div className="order-date-time"><Calendar size={11} /> {new Date(order.createdAt).toLocaleString('en-IN')}</div>
                        </div>
                        <div className="history-order-details">
                          <div className="history-order-items">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="meta-item-tag">
                                {item.name} ({item.ml}ml) x {item.quantity}
                              </div>
                            ))}
                          </div>
                          <div className="history-order-breakdown">
                            <span className={`status-badge ${order.orderStatus?.toLowerCase()}`}>
                              {order.orderStatus}
                            </span>
                            <span className={`status-badge ${order.paymentStatus}`}>
                              <CreditCard size={10} /> {order.paymentMethod?.toUpperCase()} ({order.paymentStatus})
                            </span>
                            <span className="order-final-cost">₹{order.total?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-admin-ghost" onClick={() => setShowHistoryModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
