import { useEffect, useState, useCallback, useRef } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLayout from './AdminLayout';
import {
  Plus, Search, Edit2, Trash2, RefreshCw, X, Upload, Image, Star,
  CheckCircle, XCircle, AlertTriangle, ArrowUpDown, ChevronUp, ChevronDown
} from 'lucide-react';
import './AdminLayout.css';
import './AdminProducts.css';

const EMPTY_FORM = {
  name: '', slug: '', category: 'men', collection: '', badge: '', badgeType: '',
  notes: '', price: '', originalPrice: '', description: '',
  fragranceFamily: 'Woody', gender: 'Men', image: '',
  topNotes: '', heartNotes: '', baseNotes: '',
  sizes: '50:4200',
  inStock: true, stock: 20, isNew: false, isBestseller: false,
  rating: 4.5, reviews: 0,
  suitableSkinTypes: 'all', occasions: 'evening',
};

function parseNotes(str) {
  return str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
}

function parseSizes(str) {
  return str ? str.split(',').map(part => {
    const [ml, price] = part.trim().split(':');
    return { ml: parseInt(ml) || 50, price: parseInt(price) || 0 };
  }).filter(s => s.ml && s.price) : [];
}

export default function AdminProducts() {
  const { adminFetch, adminToken, API_BASE } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Filtering states
  const [catFilter, setCatFilter] = useState('all');
  const [familyFilter, setFamilyFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  
  // Sorting states
  const [sortBy, setSortBy] = useState('id'); // 'price', 'rating', 'stock', 'id'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal / Form CRUD states
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [modalError, setModalError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const fileInputRef = useRef();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (catFilter !== 'all') params.set('category', catFilter);
      if (familyFilter !== 'all') params.set('family', familyFilter);
      if (stockFilter !== 'all') params.set('stockStatus', stockFilter);
      if (sortBy) params.set('sortBy', sortBy);
      if (sortOrder) params.set('sortOrder', sortOrder);

      const res = await fetch(`${API_BASE}/api/products?${params}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setSelectedIds([]); // Reset select list on refresh
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, catFilter, familyFilter, stockFilter, sortBy, sortOrder]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Click handler to toggle sort key and direction
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(p => p === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setModalError('');
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name || '',
      slug: product.slug || '',
      category: product.category || 'men',
      collection: product.collection || '',
      badge: product.badge || '',
      badgeType: product.badgeType || '',
      notes: product.notes || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      description: product.description || '',
      fragranceFamily: product.fragranceFamily || 'Woody',
      gender: product.gender || 'Men',
      image: product.image || '',
      topNotes: (product.topNotes || []).join(', '),
      heartNotes: (product.heartNotes || []).join(', '),
      baseNotes: (product.baseNotes || []).join(', '),
      sizes: (product.sizes || []).map(s => `${s.ml}:${s.price}`).join(', '),
      inStock: product.inStock !== false,
      stock: product.stock !== undefined ? product.stock : 20,
      isNew: !!product.isNew,
      isBestseller: !!product.isBestseller,
      rating: product.rating || 4.5,
      reviews: product.reviews || 0,
      suitableSkinTypes: (product.suitableSkinTypes || ['all']).join(', '),
      occasions: (product.occasions || ['evening']).join(', '),
    });
    setModalError('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    // Auto-generate slug from name
    if (name === 'name') {
      setForm(prev => ({
        ...prev,
        name: value,
        slug: value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        setForm(prev => ({ ...prev, image: data.url }));
      } else {
        setModalError('Image upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setModalError('Image upload failed. Check Cloudinary config.');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError('');
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        category: form.category,
        collection: form.collection,
        badge: form.badge || null,
        badgeType: form.badgeType || null,
        notes: form.notes,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        description: form.description,
        fragranceFamily: form.fragranceFamily,
        gender: form.gender,
        image: form.image,
        topNotes: parseNotes(form.topNotes),
        heartNotes: parseNotes(form.heartNotes),
        baseNotes: parseNotes(form.baseNotes),
        sizes: parseSizes(form.sizes),
        inStock: Number(form.stock) > 0 ? form.inStock : false,
        stock: Number(form.stock),
        isNew: form.isNew,
        isBestseller: form.isBestseller,
        rating: Number(form.rating),
        reviews: Number(form.reviews),
        suitableSkinTypes: parseNotes(form.suitableSkinTypes),
        occasions: parseNotes(form.occasions),
      };

      let res;
      if (editProduct) {
        res = await adminFetch(`/api/products/${editProduct.id}`, {
          method: 'PUT', body: JSON.stringify(payload),
        });
      } else {
        res = await adminFetch('/api/products', {
          method: 'POST', body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Save failed');
      }

      await fetchProducts();
      setShowModal(false);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    try {
      await adminFetch(`/api/products/${product.id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Selection callbacks
  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;
    setBulkActionLoading(true);
    try {
      const res = await adminFetch('/api/products/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: selectedIds })
      });
      if (!res.ok) throw new Error('Bulk delete failed');
      setSelectedIds([]);
      await fetchProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkStockUpdate = async (stockVal) => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const res = await adminFetch('/api/products/bulk-status', {
        method: 'PUT',
        body: JSON.stringify({
          ids: selectedIds,
          stock: stockVal,
          inStock: stockVal > 0
        })
      });
      if (!res.ok) throw new Error('Bulk status update failed');
      setSelectedIds([]);
      await fetchProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Local Search filter
  const filtered = products.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q);
  });

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">{filtered.length} product{filtered.length !== 1 ? 's' : ''} in table (out of {products.length})</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-admin-ghost" onClick={fetchProducts}><RefreshCw size={14} /> Refresh</button>
          <button className="btn-admin-primary" onClick={openAdd}><Plus size={16} /> Add Product</button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={14} />
          <input 
            className="admin-search" 
            placeholder="Search by name or slug…" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>

        {/* Category Filter */}
        <select 
          className="admin-select"
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="unisex">Unisex</option>
        </select>

        {/* Fragrance Family Filter */}
        <select 
          className="admin-select"
          value={familyFilter}
          onChange={e => setFamilyFilter(e.target.value)}
        >
          <option value="all">All Scent Families</option>
          <option value="Floral">Floral</option>
          <option value="Fresh">Fresh</option>
          <option value="Oriental">Oriental</option>
          <option value="Oud">Oud</option>
          <option value="Woody">Woody</option>
        </select>

        {/* Stock Status Filter */}
        <select 
          className="admin-select"
          value={stockFilter}
          onChange={e => setStockFilter(e.target.value)}
        >
          <option value="all">All Stock Levels</option>
          <option value="inStock">Healthy Stock (&gt;= 5)</option>
          <option value="lowStock">Low Stock (1-4)</option>
          <option value="outOfStock">Out of Stock (0)</option>
        </select>
      </div>

      {/* Bulk actions floating ribbon */}
      {selectedIds.length > 0 && (
        <div className="bulk-ribbon">
          <span className="bulk-count"><strong>{selectedIds.length}</strong> product{selectedIds.length !== 1 ? 's' : ''} selected</span>
          <div className="bulk-buttons">
            <button 
              className="btn-admin-primary bulk-btn" 
              onClick={() => handleBulkStockUpdate(20)}
              disabled={bulkActionLoading}
            >
              Set In Stock (20)
            </button>
            <button 
              className="btn-admin-ghost bulk-btn" 
              onClick={() => handleBulkStockUpdate(0)}
              disabled={bulkActionLoading}
            >
              Set Out of Stock
            </button>
            <button 
              className="btn-admin-danger bulk-btn" 
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
            >
              <Trash2 size={13} /> Delete Selected
            </button>
            <button className="close-bulk" onClick={() => setSelectedIds([])}><X size={15} /></button>
          </div>
        </div>
      )}

      <div className="products-wrap" style={{ margin: '24px 32px 0' }}>
        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /><span>Loading products…</span></div>
        ) : (
          <div className="admin-card">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 40, paddingLeft: 16 }}>
                      <input 
                        type="checkbox" 
                        checked={allSelected} 
                        onChange={handleSelectAll} 
                        style={{ cursor: 'pointer', accentColor: '#b8960c' }}
                      />
                    </th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Family</th>
                    
                    {/* Sortable headers */}
                    <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }} className="sortable-th">
                      <div className="th-sort-wrapper">
                        Price
                        {sortBy === 'price' ? (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={11} />}
                      </div>
                    </th>
                    
                    <th onClick={() => handleSort('stock')} style={{ cursor: 'pointer' }} className="sortable-th">
                      <div className="th-sort-wrapper">
                        Stock Quantity
                        {sortBy === 'stock' ? (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={11} />}
                      </div>
                    </th>
                    
                    <th onClick={() => handleSort('rating')} style={{ cursor: 'pointer' }} className="sortable-th">
                      <div className="th-sort-wrapper">
                        Rating
                        {sortBy === 'rating' ? (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={11} />}
                      </div>
                    </th>
                    
                    <th>Badges</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => {
                    const isSelected = selectedIds.includes(product.id);
                    const stockQty = product.stock !== undefined ? product.stock : 20;
                    
                    return (
                      <tr key={product._id} className={isSelected ? 'row-selected' : ''}>
                        <td style={{ paddingLeft: 16 }}>
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => handleSelectOne(product.id)}
                            style={{ cursor: 'pointer', accentColor: '#b8960c' }}
                          />
                        </td>
                        <td>
                          <div className="product-cell">
                            <div className="product-thumb">
                              {product.image ? (
                                <img
                                  src={product.image.startsWith('http') ? product.image : `http://localhost:5173${product.image}`}
                                  alt={product.name}
                                  onError={e => { e.target.style.display='none'; }}
                                />
                              ) : <Image size={18} className="thumb-placeholder" />}
                            </div>
                            <div>
                              <div className="product-name">{product.name}</div>
                              <div className="product-slug">{product.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="category-tag">{product.category}</span></td>
                        <td style={{ color: '#9ca3af' }}>{product.fragranceFamily}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#f0e6c8' }}>₹{product.price?.toLocaleString('en-IN')}</div>
                          {product.originalPrice && <div style={{ fontSize: 11, color: '#6b7280', textDecoration: 'line-through' }}>₹{product.originalPrice?.toLocaleString('en-IN')}</div>}
                        </td>
                        <td>
                          {stockQty === 0 ? (
                            <span className="status-badge cancelled">
                              <XCircle size={11} /> Out of Stock
                            </span>
                          ) : stockQty < 5 ? (
                            <span className="status-badge processing">
                              <AlertTriangle size={11} /> Low Stock ({stockQty})
                            </span>
                          ) : (
                            <span className="status-badge delivered">
                              <CheckCircle size={11} /> In Stock ({stockQty})
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b' }}>
                            <Star size={12} fill="#f59e0b" />
                            <span style={{ color: '#d1d5db', fontSize: 13 }}>{product.rating}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {product.isBestseller && <span className="mini-badge gold">Bestseller</span>}
                            {product.isNew && <span className="mini-badge blue">New</span>}
                            {product.badge && <span className="mini-badge grey">{product.badge}</span>}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-admin-ghost icon-btn" onClick={() => openEdit(product)} title="Edit">
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="btn-admin-danger icon-btn"
                              onClick={() => handleDelete(product)}
                              disabled={deletingId === product.id}
                              title="Delete"
                            >
                              {deletingId === product.id
                                ? <span className="admin-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />
                                : <Trash2 size={13} />}
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

      {/* Product Modal */}
      {showModal && (
        <div className="product-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="product-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editProduct ? `Edit: ${editProduct.name}` : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="product-form">
              {modalError && (
                <div className="modal-error"><XCircle size={14} />{modalError}</div>
              )}

              {/* Image Upload */}
              <div className="form-section">
                <div className="form-section-title">Product Image</div>
                <div className="image-upload-area">
                  {form.image ? (
                    <div className="image-preview">
                      <img
                        src={form.image.startsWith('http') ? form.image : `http://localhost:5173${form.image}`}
                        alt="Preview"
                        onError={e => e.target.style.display='none'}
                      />
                      <button type="button" className="remove-image" onClick={() => setForm(p => ({ ...p, image: '' }))}><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                      {uploadingImg ? (
                        <><div className="admin-spinner" style={{ width: 24, height: 24 }} /><span>Uploading…</span></>
                      ) : (
                        <><Upload size={24} /><span>Click to upload image</span><span className="upload-hint">JPG, PNG, WEBP</span></>
                      )}
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Or paste image URL</label>
                    <input name="image" value={form.image} onChange={handleChange} placeholder="https://... or /local-image.png" />
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="form-section">
                <div className="form-section-title">Basic Info</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Royal Oud" />
                  </div>
                  <div className="form-group">
                    <label>Slug</label>
                    <input name="slug" value={form.slug} onChange={handleChange} placeholder="auto-generated" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select name="category" value={form.category} onChange={handleChange}>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange}>
                      <option>Men</option><option>Women</option><option>Unisex</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fragrance Family</label>
                    <select name="fragranceFamily" value={form.fragranceFamily} onChange={handleChange}>
                      {['Floral', 'Fresh', 'Oriental', 'Oud', 'Woody'].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Detailed product description…" />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="form-section">
                <div className="form-section-title">Pricing & Stock Levels</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Base Price (₹) *</label>
                    <input name="price" type="number" value={form.price} onChange={handleChange} required min={0} />
                  </div>
                  <div className="form-group">
                    <label>Original Price (₹) <span className="label-hint">for sale badge</span></label>
                    <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange} min={0} />
                  </div>
                  <div className="form-group">
                    <label>Inventory Quantity *</label>
                    <input name="stock" type="number" value={form.stock} onChange={handleChange} required min={0} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Sizes <span className="label-hint">format: ml:price, ml:price</span></label>
                    <input name="sizes" value={form.sizes} onChange={handleChange} placeholder="30:2400, 50:4200, 100:7200" />
                  </div>
                </div>
                <div className="form-row checkboxes">
                  <label className="checkbox-label">
                    <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleChange} />
                    Active (Show in shop)
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="isNew" checked={form.isNew} onChange={handleChange} />
                    New Arrival
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="isBestseller" checked={form.isBestseller} onChange={handleChange} />
                    Bestseller
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="form-section">
                <div className="form-section-title">Fragrance Notes <span className="label-hint">comma-separated</span></div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Top Notes</label>
                    <input name="topNotes" value={form.topNotes} onChange={handleChange} placeholder="Bergamot, Black Pepper, Grapefruit" />
                  </div>
                  <div className="form-group">
                    <label>Heart Notes</label>
                    <input name="heartNotes" value={form.heartNotes} onChange={handleChange} placeholder="Cedarwood, Vetiver, Tobacco" />
                  </div>
                  <div className="form-group">
                    <label>Base Notes</label>
                    <input name="baseNotes" value={form.baseNotes} onChange={handleChange} placeholder="Musk, Amber, Sandalwood" />
                  </div>
                </div>
              </div>

              {/* Extra */}
              <div className="form-section">
                <div className="form-section-title">Additional Details</div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Badge Text</label>
                    <input name="badge" value={form.badge} onChange={handleChange} placeholder="BESTSELLER, NEW ARRIVAL…" />
                  </div>
                  <div className="form-group">
                    <label>Badge Type</label>
                    <select name="badgeType" value={form.badgeType} onChange={handleChange}>
                      <option value="">None</option>
                      <option value="gold">Gold</option>
                      <option value="dark">Dark</option>
                      <option value="red">Red</option>
                    </select>
                  </div>
                  <div className="notes">
                    <label>Notes Label</label>
                    <input name="notes" value={form.notes} onChange={handleChange} placeholder="WOODY · SPICY · 50ML" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Collection</label>
                    <input name="collection" value={form.collection} onChange={handleChange} placeholder="royal-oud, pour-femme…" />
                  </div>
                  <div className="form-group">
                    <label>Skin Types <span className="label-hint">comma-separated</span></label>
                    <input name="suitableSkinTypes" value={form.suitableSkinTypes} onChange={handleChange} placeholder="all, oily, dry, normal" />
                  </div>
                  <div className="form-group">
                    <label>Occasions <span className="label-hint">comma-separated</span></label>
                    <input name="occasions" value={form.occasions} onChange={handleChange} placeholder="evening, daily, office, special" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Rating</label>
                    <input name="rating" type="number" value={form.rating} onChange={handleChange} min={0} max={5} step={0.1} />
                  </div>
                  <div className="form-group">
                    <label>Reviews Count</label>
                    <input name="reviews" type="number" value={form.reviews} onChange={handleChange} min={0} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-admin-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>
                  {saving ? <><span className="admin-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</> : (editProduct ? 'Save Changes' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
