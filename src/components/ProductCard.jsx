import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product, dark = false }) {
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const [added, setAdded] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.round(rating) ? 'star filled' : 'star empty'}>★</span>
    ));
  };

  const getBadgeClass = (type) => {
    switch(type) {
      case 'gold': return 'badge badge-gold';
      case 'dark': return 'badge badge-dark';
      case 'red': return 'badge badge-red';
      case 'blue': return 'badge badge-blue';
      default: return 'badge badge-gold';
    }
  };

  return (
    <Link
      to={`/shop/${product.id}`}
      className={`product-card-wrapper ${dark ? 'dark-card' : ''}`}
      id={`product-${product.id}`}
    >
      <div className="product-card-image">
        {product.badge && (
          <span className={getBadgeClass(product.badgeType)}>
            {product.badge}
          </span>
        )}
        <button
          className={`wishlist-btn ${inWishlist ? 'wishlisted' : ''}`}
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
        <img src={product.image} alt={product.name} loading="lazy" />
        <div className="quick-view-overlay">
          <span><Eye size={14} /> QUICK VIEW</span>
        </div>
      </div>

      <div className="product-card-body">
        <div className="product-notes">{product.notes}</div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-stars">
          {renderStars(product.rating)}
          <span className="review-count">({product.reviews})</span>
        </div>
        <div className="product-footer">
          <div className="product-prices">
            <span className="product-price">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="product-original">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <button
            className={`add-to-cart-btn ${added ? 'added' : ''}`}
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            id={`add-${product.id}`}
          >
            <ShoppingCart size={13} />
            {added ? 'ADDED' : 'ADD'}
          </button>
        </div>
      </div>
    </Link>
  );
}
