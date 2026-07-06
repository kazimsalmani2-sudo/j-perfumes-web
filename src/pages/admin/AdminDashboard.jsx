import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLayout from './AdminLayout';
import {
  ShoppingBag, Package, Users, IndianRupee,
  TrendingUp, ArrowRight, Clock, AlertTriangle, Star, CheckCircle, Info
} from 'lucide-react';
import './AdminLayout.css';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { adminFetch, API_BASE } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendDays, setTrendDays] = useState(7); // 7 or 30 days toggle
  const [hoveredData, setHoveredData] = useState(null); // Tooltip state for custom SVG chart
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    adminFetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [adminFetch]);

  // Generate date series for the trend chart
  const chartData = useMemo(() => {
    if (!stats) return [];
    const data = [];
    const now = new Date();
    for (let i = trendDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = stats.revenueTrend?.find(t => t._id === dateStr);
      data.push({
        rawDate: dateStr,
        label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        revenue: match ? match.revenue : 0,
        ordersCount: match ? match.ordersCount : 0
      });
    }
    return data;
  }, [stats, trendDays]);

  // Calculate SVG dimensions and points
  const chartConfig = useMemo(() => {
    if (chartData.length === 0) return null;
    const width = 800;
    const height = 240;
    const padding = { top: 20, right: 30, bottom: 40, left: 60 };

    const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1000);
    // Round up max revenue to a clean number
    const maxVal = Math.ceil(maxRevenue / 1000) * 1000;

    const points = chartData.map((d, i) => {
      const x = padding.left + (i / (chartData.length - 1)) * (width - padding.left - padding.right);
      const y = height - padding.bottom - (d.revenue / maxVal) * (height - padding.top - padding.bottom);
      return { x, y, ...d };
    });

    // Generate line path
    let linePath = '';
    let areaPath = '';
    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      // Area path goes to bottom
      areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;
    }

    return { width, height, padding, maxVal, points, linePath, areaPath };
  }, [chartData]);

  const STAT_CARDS = stats ? [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: '#f59e0b',
      link: '/admin/orders',
    },
    {
      label: 'Revenue (paid)',
      value: `₹${(stats.revenue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: '#4ade80',
      link: '/admin/orders',
    },
    {
      label: 'Products',
      value: stats.totalProducts,
      icon: Package,
      color: '#818cf8',
      link: '/admin/products',
    },
    {
      label: 'Customers',
      value: stats.totalUsers,
      icon: Users,
      color: '#60a5fa',
      link: '/admin/users',
    },
  ] : [];

  const handleMouseMove = (e, svgConfig) => {
    if (!svgConfig) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgConfig.width;
    
    // Find closest point by X coordinate
    let closest = null;
    let closestIdx = 0;
    let minDist = Infinity;
    
    svgConfig.points.forEach((p, idx) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closest = p;
        closestIdx = idx;
      }
    });

    if (closest) {
      setHoveredData(closest);
      setHoveredIdx(closestIdx);
    }
  };

  const handleMouseLeave = () => {
    setHoveredData(null);
    setHoveredIdx(null);
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Welcome back — here's your store overview</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Loading stats…</span>
        </div>
      ) : (
        <div className="dashboard-body">
          {/* Stat Cards */}
          <div className="stat-cards">
            {STAT_CARDS.map(card => (
              <Link to={card.link} key={card.label} className="stat-card">
                <div className="stat-card-icon" style={{ background: `${card.color}18`, color: card.color }}>
                  <card.icon size={22} />
                </div>
                <div className="stat-card-body">
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-label">{card.label}</div>
                </div>
                <TrendingUp size={14} className="stat-trend" style={{ color: card.color }} />
              </Link>
            ))}
          </div>

          {/* Sales Trend Chart */}
          <div className="dashboard-section chart-section">
            <div className="section-header">
              <div className="section-title">
                <TrendingUp size={16} />
                Revenue Trend ({trendDays} Days)
              </div>
              <div className="chart-toggles">
                <button 
                  className={`chart-toggle-btn ${trendDays === 7 ? 'active' : ''}`}
                  onClick={() => { setTrendDays(7); handleMouseLeave(); }}
                >
                  7 Days
                </button>
                <button 
                  className={`chart-toggle-btn ${trendDays === 30 ? 'active' : ''}`}
                  onClick={() => { setTrendDays(30); handleMouseLeave(); }}
                >
                  30 Days
                </button>
              </div>
            </div>

            {chartConfig && (
              <div className="admin-card chart-card">
                <div className="chart-tooltip-area">
                  {hoveredData ? (
                    <div className="chart-tooltip-content">
                      <span className="tooltip-date">{hoveredData.label}</span>
                      <span className="tooltip-value">Revenue: <strong>₹{hoveredData.revenue.toLocaleString('en-IN')}</strong></span>
                      <span className="tooltip-sub">Orders: {hoveredData.ordersCount}</span>
                    </div>
                  ) : (
                    <div className="chart-tooltip-placeholder">
                      <Info size={12} /> Hover over graph to see details
                    </div>
                  )}
                </div>

                <div className="chart-svg-container">
                  <svg 
                    viewBox={`0 0 ${chartConfig.width} ${chartConfig.height}`} 
                    className="trend-svg"
                    onMouseMove={(e) => handleMouseMove(e, chartConfig)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#b8960c" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#b8960c" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#d4af37" />
                        <stop offset="100%" stopColor="#b8960c" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines & Y Axis labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                      const y = chartConfig.padding.top + val * (chartConfig.height - chartConfig.padding.top - chartConfig.padding.bottom);
                      const labelVal = Math.round(chartConfig.maxVal * (1 - val));
                      return (
                        <g key={idx} className="chart-grid-group">
                          <line 
                            x1={chartConfig.padding.left} 
                            y1={y} 
                            x2={chartConfig.width - chartConfig.padding.right} 
                            y2={y} 
                            stroke="rgba(255,255,255,0.05)" 
                            strokeDasharray="4"
                          />
                          <text 
                            x={chartConfig.padding.left - 10} 
                            y={y + 4} 
                            fill="#6b7280" 
                            fontSize="10" 
                            textAnchor="end"
                          >
                            ₹{labelVal >= 1000 ? `${(labelVal/1000)}k` : labelVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* Area path */}
                    <path d={chartConfig.areaPath} fill="url(#chartAreaGrad)" />

                    {/* Line path */}
                    <path 
                      d={chartConfig.linePath} 
                      fill="none" 
                      stroke="url(#chartLineGrad)" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                    />

                    {/* Data dots on hover / select */}
                    {chartConfig.points.map((p, idx) => (
                      <g key={idx}>
                        {/* Hidden hover target */}
                        <circle cx={p.x} cy={p.y} r="8" fill="transparent" style={{ cursor: 'pointer' }} />
                        
                        {/* Visible point */}
                        {hoveredIdx === idx && (
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="5" 
                            fill="#b8960c" 
                            stroke="#111113" 
                            strokeWidth="2" 
                          />
                        )}
                      </g>
                    ))}

                    {/* X Axis labels */}
                    {chartConfig.points.filter((_, idx) => {
                      // Filter X labels to avoid crowding
                      if (trendDays === 7) return true;
                      return idx % 4 === 0;
                    }).map((p, idx) => (
                      <text 
                        key={idx} 
                        x={p.x} 
                        y={chartConfig.height - 12} 
                        fill="#6b7280" 
                        fontSize="10" 
                        textAnchor="middle"
                      >
                        {p.label}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>
            )}
          </div>

          <div className="dashboard-grid">
            {/* Top Selling Products Widget */}
            <div className="dashboard-section">
              <div className="section-header">
                <div className="section-title">
                  <Star size={16} style={{ color: '#b8960c' }} />
                  Top Selling Products
                </div>
              </div>
              <div className="admin-card top-selling-card">
                {stats?.topSellingProducts?.length > 0 ? (
                  <div className="top-selling-list">
                    {stats.topSellingProducts.map((p, idx) => (
                      <div key={p._id || idx} className="top-selling-item">
                        <span className="rank-num">#{idx + 1}</span>
                        <div className="item-img">
                          {p.image ? (
                            <img src={p.image.startsWith('http') ? p.image : `http://localhost:5173${p.image}`} alt={p.name} />
                          ) : (
                            <div className="item-img-placeholder">💎</div>
                          )}
                        </div>
                        <div className="item-info">
                          <div className="item-name">{p.name}</div>
                          <div className="item-sales">{p.totalQty} units sold</div>
                        </div>
                        <div className="item-revenue">₹{p.totalRevenue?.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-empty">
                    <p>No sales data recorded yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock Alerts Widget */}
            <div className="dashboard-section">
              <div className="section-header">
                <div className="section-title text-danger">
                  <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                  Low Stock Alerts
                </div>
              </div>
              <div className="admin-card low-stock-card">
                {stats?.lowStockProducts?.length > 0 ? (
                  <div className="low-stock-list">
                    {stats.lowStockProducts.map(p => (
                      <div key={p.id} className="low-stock-item">
                        <div className="item-img">
                          {p.image ? (
                            <img src={p.image.startsWith('http') ? p.image : `http://localhost:5173${p.image}`} alt={p.name} />
                          ) : (
                            <div className="item-img-placeholder">💎</div>
                          )}
                        </div>
                        <div className="item-info">
                          <div className="item-name">{p.name}</div>
                          <div className="item-category">{p.category?.toUpperCase()} · {p.fragranceFamily}</div>
                        </div>
                        <div className="item-stock">
                          <span className={`stock-count-badge ${p.stock === 0 ? 'out' : 'low'}`}>
                            {p.stock === 0 ? 'Out of Stock' : `${p.stock} Left`}
                          </span>
                        </div>
                        <Link to={`/admin/products`} className="item-edit-link">Update</Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-empty stock-healthy">
                    <CheckCircle size={32} className="healthy-icon" />
                    <h3>All stock levels healthy</h3>
                    <p>No products are currently low on stock.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="dashboard-section">
            <div className="section-header">
              <div className="section-title">
                <Clock size={16} />
                Recent Orders
              </div>
              <Link to="/admin/orders" className="section-link">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {stats?.recentOrders?.length > 0 ? (
              <div className="admin-card">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map(order => (
                        <tr key={order._id}>
                          <td>
                            <Link to={`/admin/orders`} className="order-id-link">
                              #{order.orderId}
                            </Link>
                          </td>
                          <td>
                            <div className="customer-name">{order.customer?.name}</div>
                            <div className="customer-email">{order.customer?.email}</div>
                          </td>
                          <td>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                          <td className="amount-cell">₹{order.total?.toLocaleString('en-IN')}</td>
                          <td>
                            <span className={`status-badge ${order.paymentStatus}`}>
                              {order.paymentMethod?.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${order.orderStatus?.toLowerCase()}`}
                            >
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="date-cell">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="admin-card">
                <div className="admin-empty">
                  <div className="admin-empty-icon">📦</div>
                  <h3>No orders yet</h3>
                  <p>Orders placed on your store will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
