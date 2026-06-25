import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './Cart.css';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, discountAmount, shipping, total, applyPromoCode, promoCode } = useCart();
  const { user } = useAuth();
  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState(null);

  const handlePromo = (e) => {
    e.preventDefault();
    const result = applyPromoCode(promoInput);
    setPromoMsg(result);
    setTimeout(() => setPromoMsg(null), 3000);
  };

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <ShoppingBag size={64} color="var(--border-light)" />
            <h2>Your cart is empty</h2>
            <p>Discover our luxury fragrances and add your favourites.</p>
            <Link to="/shop" className="btn btn-gold" id="cart-shop-btn">
              SHOP FRAGRANCES <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="container">
        <div className="section-label line-left" style={{marginBottom: 8}}>
          <span>YOUR BAG</span>
        </div>
        <h1 className="page-hero-title" style={{marginBottom: 40}}>Shopping Cart</h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.cartKey} className="cart-item" id={`cart-item-${item.cartKey}`}>
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-size">{item.selectedSize.ml}ml</div>
                  <div className="cart-item-price">₹{item.price.toLocaleString()}</div>
                </div>
                <div className="cart-item-controls">
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}>
                      <Minus size={12} />
                    </button>
                    <span className="qty-val">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}>
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="cart-item-total">₹{(item.price * item.quantity).toLocaleString()}</div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.cartKey)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3 className="summary-title">ORDER SUMMARY</h3>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'free-shipping' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="summary-row discount">
                  <span>Discount ({promoCode})</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="summary-divider" />
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Promo Code */}
            <form className="promo-form" onSubmit={handlePromo}>
              <input
                type="text"
                placeholder="Promo code..."
                value={promoInput}
                onChange={e => setPromoInput(e.target.value)}
                className="promo-input"
                id="promo-input"
              />
              <button type="submit" className="promo-btn" id="promo-apply">
                APPLY
              </button>
            </form>
            {promoMsg && (
              <p className={`promo-msg ${promoMsg.success ? 'success' : 'error'}`}>
                {promoMsg.message}
              </p>
            )}
            <p className="promo-hint">Try: LUXURY10, WELCOME15, JPERFUME20</p>

            {!user ? (
              <>
                <p className="login-prompt-msg" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', textAlign: 'center' }}>
                  Please sign in to complete your purchase.
                </p>
                <Link to="/login" state={{ from: { pathname: "/checkout" } }} className="btn btn-gold checkout-btn" id="checkout-btn">
                  SIGN IN TO CHECKOUT <ArrowRight size={14} />
                </Link>
              </>
            ) : (
              <Link to="/checkout" className="btn btn-gold checkout-btn" id="checkout-btn">
                PROCEED TO CHECKOUT <ArrowRight size={14} />
              </Link>
            )}

            <Link to="/shop" className="continue-shopping">
              ← Continue Shopping
            </Link>

            {shipping > 0 && (
              <p className="free-shipping-hint">
                Add ₹{(999 - subtotal).toLocaleString()} more for FREE shipping!
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
