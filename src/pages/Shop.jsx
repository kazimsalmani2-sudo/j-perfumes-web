import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: 'all',
    fragranceFamily: 'all',
    size: 'all',
    priceRange: [0, 10000],
    inStock: false,
    onSale: false,
    sortBy: 'featured'
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if any active filters
  const hasActiveFilters = 
    filters.category !== 'all' ||
    filters.fragranceFamily !== 'all' ||
    filters.size !== 'all' ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== 10000 ||
    filters.inStock ||
    filters.onSale;

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      fragranceFamily: 'all',
      size: 'all',
      priceRange: [0, 10000],
      inStock: false,
      onSale: false,
      sortBy: 'featured'
    });
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(p => p.category === filters.category);
    }

    // Fragrance Family filter
    if (filters.fragranceFamily !== 'all') {
      result = result.filter(p => p.fragranceFamily.toLowerCase() === filters.fragranceFamily);
    }

    // Size filter
    if (filters.size !== 'all') {
      result = result.filter(p => p.sizes.some(s => s.ml === parseInt(filters.size)));
    }

    // Price range filter
    result = result.filter(p => 
      p.price >= filters.priceRange[0] && 
      p.price <= filters.priceRange[1]
    );

    // In Stock filter
    if (filters.inStock) {
      result = result.filter(p => p.inStock);
    }

    // On Sale filter
    if (filters.onSale) {
      result = result.filter(p => p.originalPrice);
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return result;
  }, [filters]);

  // Organize products into rows of 3 for centering last row
  const productRows = [];
  for (let i = 0; i < filteredProducts.length; i += 3) {
    productRows.push(filteredProducts.slice(i, i + 3));
  }

  return (
    <main className="shop-page">
      {/* Page Header */}
      <section className="page-hero">
        <div className="container">
          <div className="section-label line-left"><span>SHOP</span></div>
          <h1 className="page-hero-title">All Fragrances</h1>
          <p className="page-hero-subtitle">Explore our complete collection of luxury perfumes and attars.</p>
        </div>
      </section>

      <div className="shop-layout container">
        {/* Sidebar */}
        <aside className={`shop-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          {/* Clear All Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: '1px solid #B8960C',
                color: '#B8960C',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <X size={14} /> Clear All Filters
            </button>
          )}

          <div className="sidebar-section">
            <h3 className="sidebar-heading">CATEGORY</h3>
            {[
              { value: 'all', label: 'All' },
              { value: 'men', label: 'Men' },
              { value: 'unisex', label: 'Unisex' },
              { value: 'women', label: 'Women' },
            ].map(opt => (
              <label key={opt.value} className="sidebar-option">
                <input
                  type="radio"
                  name="category"
                  value={opt.value}
                  checked={filters.category === opt.value}
                  onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-heading">PRICE RANGE</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#B8960C', fontWeight: '600', fontSize: '13px' }}>
                ₹{filters.priceRange[0].toLocaleString()}
              </span>
              <span style={{ color: '#B8960C', fontWeight: '600', fontSize: '13px' }}>
                ₹{filters.priceRange[1].toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10000}
              step={100}
              value={filters.priceRange[0]}
              onChange={e => setFilters(prev => ({
                ...prev,
                priceRange: [Number(e.target.value), prev.priceRange[1]]
              }))}
              style={{ width: '100%', accentColor: '#B8960C' }}
            />
            <input
              type="range"
              min={0}
              max={10000}
              step={100}
              value={filters.priceRange[1]}
              onChange={e => setFilters(prev => ({
                ...prev,
                priceRange: [prev.priceRange[0], Number(e.target.value)]
              }))}
              style={{ width: '100%', accentColor: '#B8960C', marginTop: '8px' }}
            />
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-heading">FRAGRANCE FAMILY</h3>
            {['all', 'floral', 'fresh', 'oriental', 'oud', 'woody'].map(f => (
              <label key={f} className="sidebar-option">
                <input
                  type="radio"
                  name="family"
                  value={f}
                  checked={filters.fragranceFamily === f}
                  onChange={e => setFilters(prev => ({ ...prev, fragranceFamily: e.target.value }))}
                />
                <span>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}</span>
              </label>
            ))}
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-heading">SIZE</h3>
            {['all', '30', '50', '100'].map(s => (
              <label key={s} className="sidebar-option">
                <input
                  type="radio"
                  name="size"
                  value={s}
                  checked={filters.size === s}
                  onChange={e => setFilters(prev => ({ ...prev, size: e.target.value }))}
                />
                <span>{s === 'all' ? 'All Sizes' : `${s}ml`}</span>
              </label>
            ))}
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-heading">AVAILABILITY</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '12px' }}>
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={e => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                style={{ accentColor: '#B8960C' }}
              />
              <span>In Stock</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={e => setFilters(prev => ({ ...prev, onSale: e.target.checked }))}
                style={{ accentColor: '#B8960C' }}
              />
              <span>On Sale</span>
            </label>
          </div>
        </aside>

        {/* Main Content */}
        <div className="shop-main">
          {/* Sort Bar */}
          <div className="sort-bar">
            <span className="showing-text">
              Showing <strong>{filteredProducts.length}</strong>{' '}
              product{filteredProducts.length !== 1 ? 's' : ''}
              {hasActiveFilters && ` (filtered from ${products.length})`}
            </span>
            <div className="sort-select-wrapper">
              <select
                value={filters.sortBy}
                onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="sort-select"
                id="sort-select"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {productRows.map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  style={{
                    display: 'flex',
                    justifyContent: row.length < 3 ? 'center' : 'flex-start',
                    gap: '24px',
                    flexWrap: 'wrap'
                  }}
                >
                  {row.map(product => (
                    <div
                      key={product.id}
                      style={{
                        flex: row.length === 3 ? '0 0 calc(33.333% - 16px)' : '0 0 calc(33.333% - 16px)'
                      }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>No fragrances match your filters.</p>
              <button
                className="btn btn-outline-gold"
                onClick={clearAllFilters}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
