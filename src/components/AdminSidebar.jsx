import { useEffect, useState, useRef, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  LayoutDashboard, ShoppingBag, Package, Users, LogOut, ExternalLink, 
  FlaskConical, BarChart3, Ticket, Settings, Bell, X, Sparkles
} from 'lucide-react';
import './AdminSidebar.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag, badge: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/users', label: 'Customers', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const { adminUser, adminLogout, adminFetch } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Notification and toast states
  const [unreadOrders, setUnreadOrders] = useState(0);
  const [toast, setToast] = useState(null);
  const prevTotal = useRef(null);

  // Clear unread count when viewing orders page
  useEffect(() => {
    if (location.pathname === '/admin/orders') {
      setUnreadOrders(0);
    }
  }, [location.pathname]);

  // Polling logic for new orders
  useEffect(() => {
    const checkNewOrders = async () => {
      try {
        const res = await adminFetch('/api/orders?limit=1');
        if (!res.ok) return;
        const data = await res.json();
        const currentTotal = data.total || 0;

        if (prevTotal.current !== null && currentTotal > prevTotal.current) {
          const newCount = currentTotal - prevTotal.current;
          setUnreadOrders(p => p + newCount);

          // Get latest order details
          const latestRes = await adminFetch('/api/orders?limit=1');
          if (latestRes.ok) {
            const latestData = await latestRes.json();
            const latestOrder = latestData.orders?.[0];
            if (latestOrder) {
              setToast({
                orderId: latestOrder.orderId,
                name: latestOrder.customer?.name || 'Guest Customer',
                total: latestOrder.total
              });
              // Play a subtle notification sound (optional/chime)
              try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav');
                audio.volume = 0.3;
                audio.play();
              } catch (e) {}
            }
          }
        }
        prevTotal.current = currentTotal;
      } catch (err) {
        console.error("New orders polling error:", err);
      }
    };

    checkNewOrders();
    const timer = setInterval(checkNewOrders, 12000); // Poll every 12 seconds
    return () => clearInterval(timer);
  }, [adminFetch]);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <>
      <aside className="admin-sidebar">
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <FlaskConical size={22} className="logo-icon logo-icon-glow" />
          <div>
            <div className="logo-title">J Perfumewala</div>
            <div className="logo-sub">Admin panel</div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="admin-sidebar-user">
          <div className="admin-avatar">{adminUser?.email?.charAt(0).toUpperCase()}</div>
          <div>
            <div className="admin-name">Administrator</div>
            <div className="admin-email">{adminUser?.email}</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="admin-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {badge && unreadOrders > 0 && (
                <span className="sidebar-unread-badge">{unreadOrders}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="admin-sidebar-footer">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-nav-link store-link"
          >
            <ExternalLink size={18} />
            <span>View Store</span>
          </a>
          <button className="admin-nav-link logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="order-toast-notification" onClick={() => { navigate('/admin/orders'); setToast(null); }}>
          <div className="toast-icon-wrap">
            <Sparkles size={18} className="sparkle-gold" />
          </div>
          <div className="toast-body">
            <div className="toast-header-text">New Order Placed!</div>
            <div className="toast-desc">
              Order <strong>#{toast.orderId}</strong> by {toast.name} (Total: ₹{toast.total?.toLocaleString()})
            </div>
          </div>
          <button className="toast-close-btn" onClick={(e) => { e.stopPropagation(); setToast(null); }}>
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}
