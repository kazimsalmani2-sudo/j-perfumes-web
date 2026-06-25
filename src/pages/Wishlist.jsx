import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './Wishlist.css';

export default function Wishlist() {
  const { wishlistItems, addToWishlist, addToCart } = useCart();

  return (
    <main className="wishlist-page">
      <section className="page-hero">
        <div className="container">
          <div className="section-label line-left">
            <span>MY FAVORITES</span>
          </div>
          <h1 className="page-hero-title">Wishlist</h1>
          <p className="page-hero-subtitle">
            Keep track of your favorite fragrances and add them to your collection when ready.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {wishlistItems.length === 0 ? (
            <div className="empty-wishlist text-center">
              <div className="empty-wishlist-icon">
                <Heart size={48} strokeWidth={1} style={{ fill: 'none', color: 'var(--text-light)' }} />
              </div>
              <h3 className="empty-title">Your Wishlist is Empty</h3>
              <p className="empty-text">
                Browse our collections and tap the heart icon to save products here.
              </p>
              <Link to="/shop" className="btn btn-gold">
                EXPLORE FRAGRANCES
              </Link>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlistItems.map(item => (
                <div key={item.id} className="wishlist-item-card">
                  <ProductCard product={item} />
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => addToWishlist(item)}
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} /> REMOVE
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
