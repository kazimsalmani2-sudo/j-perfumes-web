import { useEffect, useState, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLayout from './AdminLayout';
import { RefreshCw, BarChart3, TrendingUp, DollarSign, Calendar, Flame, Package } from 'lucide-react';
import './AdminLayout.css';
import './AdminAnalytics.css';

export default function AdminAnalytics() {
  const { adminFetch } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        adminFetch('/api/orders?limit=200'),
        adminFetch('/api/products')
      ]);
      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      setOrders(ordersData.orders || []);
      setProducts(productsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  // Fallback wrapper for useCallback
  function useCallback(fn, deps) {
    return useMemo(() => fn, deps);
  }

  useEffect(() => { fetchData(); }, [fetchData]);

  // Aggregated Analytics Calculations
  const stats = useMemo(() => {
    if (orders.length === 0) return null;

    // Filter paid orders
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    
    // Total Revenue
    const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

    // Sales by Category
    const categorySales = { men: 0, women: 0, unisex: 0 };
    // Bestselling items map
    const productQtyMap = {};
    
    paidOrders.forEach(o => {
      o.items?.forEach(item => {
        // Find product category from catalog or default
        const product = products.find(p => p.id === item.productId || p.name === item.name);
        const cat = product?.category || 'unisex';
        categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);

        // Product sales count
        productQtyMap[item.name] = (productQtyMap[item.name] || 0) + item.quantity;
      });
    });

    // Sort bestselling items list
    const bestSellers = Object.keys(productQtyMap).map(name => ({
      name,
      qty: productQtyMap[name],
      image: products.find(p => p.name === name)?.image || ''
    })).sort((a, b) => b.qty - a.qty).slice(0, 5);

    // Group sales by Month (last 6 months)
    const monthlySales = {};
    paidOrders.forEach(o => {
      const date = new Date(o.createdAt);
      const monthYear = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      monthlySales[monthYear] = (monthlySales[monthYear] || 0) + o.total;
    });

    // Make clean months array (ordered)
    const monthKeys = Object.keys(monthlySales).slice(-6); // last 6 months
    const monthlyData = monthKeys.map(k => ({
      label: k,
      revenue: monthlySales[k]
    }));

    return {
      revenue,
      totalPaidOrders: paidOrders.length,
      categorySales,
      bestSellers,
      monthlyData
    };
  }, [orders, products]);

  // SVG dimensions for Monthly Bar Chart
  const barChartWidth = 600;
  const barChartHeight = 240;
  const barChartPadding = { top: 20, right: 20, bottom: 40, left: 60 };

  const barChartPoints = useMemo(() => {
    if (!stats || stats.monthlyData.length === 0) return [];
    const maxVal = Math.max(...stats.monthlyData.map(d => d.revenue), 1000);
    const scale = Math.ceil(maxVal / 1000) * 1000;

    return stats.monthlyData.map((d, i) => {
      const x = barChartPadding.left + (i / (stats.monthlyData.length)) * (barChartWidth - barChartPadding.left - barChartPadding.right) + 20;
      const barHeight = (d.revenue / scale) * (barChartHeight - barChartPadding.top - barChartPadding.bottom);
      const y = barChartHeight - barChartPadding.bottom - barHeight;
      return { x, y, barHeight, label: d.label, revenue: d.revenue, maxScale: scale };
    });
  }, [stats]);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Analytics & Reports</h1>
          <p className="admin-page-subtitle">Detailed review of your sales, category share, and month-over-month performance</p>
        </div>
        <button className="btn-admin-ghost" onClick={fetchData}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Loading analytics metrics…</span>
        </div>
      ) : !stats ? (
        <div className="admin-card" style={{ margin: '24px 32px' }}>
          <div className="admin-empty">
            <div className="admin-empty-icon">📊</div>
            <h3>No data to report</h3>
            <p>Wait for customers to place and pay for orders to view analytics report graphs.</p>
          </div>
        </div>
      ) : (
        <div className="analytics-body">
          {/* Top Aggregates */}
          <div className="analytics-overview-row">
            <div className="overview-metric-card">
              <DollarSign size={20} className="metric-icon gold-glow" />
              <div className="metric-details">
                <span className="metric-label">Total Revenue (Paid)</span>
                <span className="metric-val">₹{stats.revenue.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="overview-metric-card">
              <TrendingUp size={20} className="metric-icon green-glow" />
              <div className="metric-details">
                <span className="metric-label">Average Order Value</span>
                <span className="metric-val">
                  ₹{stats.totalPaidOrders > 0 ? Math.round(stats.revenue / stats.totalPaidOrders).toLocaleString('en-IN') : 0}
                </span>
              </div>
            </div>
            <div className="overview-metric-card">
              <Calendar size={20} className="metric-icon blue-glow" />
              <div className="metric-details">
                <span className="metric-label">Sales Transactions</span>
                <span className="metric-val">{stats.totalPaidOrders} orders</span>
              </div>
            </div>
          </div>

          <div className="analytics-grid">
            {/* Monthly Sales Comparison Bar Chart */}
            <div className="admin-card analytics-card">
              <div className="card-header">
                <h3><BarChart3 size={15} /> Monthly Sales Performance</h3>
              </div>
              <div className="bar-chart-container">
                <svg viewBox={`0 0 ${barChartWidth} ${barChartHeight}`} className="bar-svg">
                  {/* Grid lines and Y labels */}
                  {barChartPoints.length > 0 && [0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                    const y = barChartPadding.top + val * (barChartHeight - barChartPadding.top - barChartPadding.bottom);
                    const scaleVal = Math.round(barChartPoints[0].maxScale * (1 - val));
                    return (
                      <g key={idx}>
                        <line 
                          x1={barChartPadding.left} 
                          y1={y} 
                          x2={barChartWidth - barChartPadding.right} 
                          y2={y} 
                          stroke="rgba(255,255,255,0.05)" 
                          strokeDasharray="4"
                        />
                        <text x={barChartPadding.left - 10} y={y + 4} fill="#6b7280" fontSize="9" textAnchor="end">
                          ₹{scaleVal >= 1000 ? `${scaleVal/1000}k` : scaleVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* Columns / Bars */}
                  {barChartPoints.map((p, idx) => (
                    <g key={idx} className="bar-group">
                      <rect
                        x={p.x}
                        y={p.y}
                        width="36"
                        height={p.barHeight}
                        fill="linear-gradient(to top, #b8960c, #f59e0b)"
                        rx="4"
                        className="bar-rect"
                        style={{ fill: '#b8960c', opacity: 0.85 }}
                      />
                      {/* Tooltip value on top */}
                      <text x={p.x + 18} y={p.y - 6} fill="#f0e6c8" fontSize="9" fontWeight="600" textAnchor="middle">
                        ₹{p.revenue >= 1000 ? `${Math.round(p.revenue/1000)}k` : p.revenue}
                      </text>
                      {/* X label */}
                      <text x={p.x + 18} y={barChartHeight - 16} fill="#6b7280" fontSize="10" textAnchor="middle">
                        {p.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Category Revenue Share Widget */}
            <div className="admin-card analytics-card">
              <div className="card-header">
                <h3><Package size={15} /> Revenue by Category</h3>
              </div>
              <div className="category-shares-content">
                {['men', 'women', 'unisex'].map(cat => {
                  const val = stats.categorySales[cat] || 0;
                  const percent = stats.revenue > 0 ? Math.round((val / stats.revenue) * 100) : 0;
                  
                  // Color variants
                  const color = cat === 'men' ? '#60a5fa' : cat === 'women' ? '#f472b6' : '#b8960c';
                  
                  return (
                    <div key={cat} className="category-progress-item">
                      <div className="progress-item-header">
                        <span className="cat-title" style={{ textTransform: 'capitalize' }}>
                          <span className="dot" style={{ background: color }} />
                          {cat} Collection
                        </span>
                        <span className="cat-val">₹{val.toLocaleString('en-IN')} ({percent}%)</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${percent}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bestselling items widget */}
          <div className="admin-card analytics-card" style={{ marginTop: 24 }}>
            <div className="card-header">
              <h3><Flame size={15} style={{ color: '#ef4444' }} /> Best-Selling Fragrances Catalog</h3>
            </div>
            <div className="analytics-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Product</th>
                    <th>Units Sold</th>
                    <th>Estimated Income contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.bestSellers.map((item, idx) => {
                    const matchedCatalog = products.find(p => p.name === item.name);
                    const itemRevenue = item.qty * (matchedCatalog?.price || 0);
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700, color: '#b8960c' }}>#{idx + 1}</td>
                        <td>
                          <div className="product-cell">
                            <div className="product-thumb">
                              {item.image ? (
                                <img src={item.image.startsWith('http') ? item.image : `http://localhost:5173${item.image}`} alt={item.name} onError={e => e.target.style.display='none'} />
                              ) : <div className="thumb-placeholder">💎</div>}
                            </div>
                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                          </div>
                        </td>
                        <td>{item.qty} bottles</td>
                        <td style={{ fontWeight: 700, color: '#4ade80' }}>₹{itemRevenue.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
