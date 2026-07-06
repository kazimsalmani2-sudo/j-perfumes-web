import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft, Shield, Truck, RotateCcw, Star } from 'lucide-react';
import { products as staticProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  
  const [product, setProduct] = useState(null);
  const [dbProducts, setDbProducts] = useState(staticProducts);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState('notes');

  useEffect(() => {
    setLoading(true);
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    
    // Fetch all products (for related section)
    fetch(`${apiBase}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDbProducts(data);
        }
      })
      .catch(err => console.error(err));

    // Fetch the single product
    const identifier = id;
    fetch(`${apiBase}/api/products/${identifier}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setProduct(data);
          // Set default size once product is loaded
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[Math.min(1, data.sizes.length - 1)]);
          }
        } else {
          const fallback = staticProducts.find(p => p.id === parseInt(id) || p.slug === id);
          if (fallback) {
            setProduct(fallback);
            if (fallback.sizes && fallback.sizes.length > 0) {
              setSelectedSize(fallback.sizes[Math.min(1, fallback.sizes.length - 1)]);
            }
          }
        }
      })
      .catch(err => {
        const fallback = staticProducts.find(p => p.id === parseInt(id) || p.slug === id);
        if (fallback) {
          setProduct(fallback);
          if (fallback.sizes && fallback.sizes.length > 0) {
            setSelectedSize(fallback.sizes[Math.min(1, fallback.sizes.length - 1)]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main style={{ padding: '200px 0', textAlign: 'center', color: '#6b7280' }}>
        <div className="admin-spinner" style={{ margin: '0 auto 16px', width: 32, height: 32, border: '3px solid rgba(184,150,12,0.2)', borderTopColor: '#b8960c', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
        <span>Loading product details...</span>
      </main>
    );
  }

  if (!product) {
    return (
      <main style={{ padding: '200px 0', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/shop" className="btn btn-gold" style={{ marginTop: 24, display: 'inline-flex' }}>
          Back to Shop
        </Link>
      </main>
    );
  }

  const activeSize = selectedSize || product.sizes[Math.min(1, product.sizes.length - 1)];
  const inWishlist = isInWishlist(product.id);
  const related = dbProducts.filter(p => p.id !== product.id && p.fragranceFamily === product.fragranceFamily).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, activeSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, activeSize, quantity);
    navigate('/checkout');
  };

  const renderStars = (rating) => (
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < Math.floor(rating) ? 'var(--gold-dark)' : 'none'}
        color={i < Math.floor(rating) ? 'var(--gold-dark)' : '#ddd'}
      />
    ))
  );

  return (
    <main className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={14} /> Back
          </button>
          <span className="breadcrumb-sep">/</span>
          <Link to="/shop">Shop</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail-grid">
          {/* Left: Images */}
          <div className="product-images">
            <div className="product-main-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-thumbnails">
              {[product.image, product.image].map((img, i) => (
                <div key={i} className="thumbnail active">
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="product-info">
            {product.badge && (
              <span className={`badge badge-${product.badgeType}`}>{product.badge}</span>
            )}

            <h1 className="product-detail-name">{product.name}</h1>

            <div className="product-detail-rating">
              <div className="stars-row">{renderStars(product.rating)}</div>
              <span className="rating-num">{product.rating}</span>
              <span className="rating-count">({product.reviews} reviews)</span>
            </div>

            <div className="product-detail-price">
              ₹{activeSize.price.toLocaleString()}
              {product.originalPrice && (
                <span className="detail-original">₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="product-detail-desc">{product.description}</p>

            {/* Scent Pyramid */}
            <div className="scent-pyramid">
              <h4 className="pyramid-title">SCENT PYRAMID</h4>
              <div className="pyramid-row">
                <span className="pyramid-label">🌿 TOP NOTES</span>
                <span className="pyramid-notes">{product.topNotes.join(', ')}</span>
              </div>
              <div className="pyramid-row">
                <span className="pyramid-label">🌸 HEART NOTES</span>
                <span className="pyramid-notes">{product.heartNotes.join(', ')}</span>
              </div>
              <div className="pyramid-row">
                <span className="pyramid-label">🪵 BASE NOTES</span>
                <span className="pyramid-notes">{product.baseNotes.join(', ')}</span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="size-selector">
              <h4 className="size-label">SELECT SIZE</h4>
              <div className="size-options">
                {product.sizes.map(size => (
                  <button
                    key={size.ml}
                    className={`size-btn ${activeSize.ml === size.ml ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                    id={`size-${product.id}-${size.ml}`}
                  >
                    <span className="size-ml">{size.ml}ml</span>
                    <span className="size-price">₹{size.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="quantity-row">
              <h4 className="size-label">QUANTITY</h4>
              <div className="qty-controls">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  id="qty-minus"
                >−</button>
                <span className="qty-val">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(q => q + 1)}
                  id="qty-plus"
                >+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className={`btn btn-gold add-btn ${added ? 'added' : ''}`}
                onClick={handleAddToCart}
                id={`detail-add-${product.id}`}
              >
                <ShoppingCart size={16} />
                {added ? 'ADDED TO CART!' : 'ADD TO CART'}
              </button>
              <button
                className="btn btn-dark buy-btn"
                onClick={handleBuyNow}
                id={`detail-buy-${product.id}`}
              >
                BUY NOW
              </button>
            </div>

            {/* Wishlist */}
            <button
              className={`wishlist-link ${inWishlist ? 'wishlisted' : ''}`}
              onClick={() => addToWishlist(product)}
              id={`wishlist-${product.id}`}
            >
              <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
              {inWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </button>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge">
                <Shield size={14} />
                <span>100% Authentic</span>
              </div>
              <div className="trust-badge">
                <Truck size={14} />
                <span>Free Shipping above ₹999</span>
              </div>
              <div className="trust-badge">
                <RotateCcw size={14} />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="related-section">
            <div className="section-center-header">
              <div className="section-label"><span>YOU MAY ALSO LIKE</span></div>
              <h2 className="section-title" style={{textAlign: 'center'}}>Similar Fragrances</h2>
            </div>
            <div className="products-grid-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
