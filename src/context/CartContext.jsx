import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const addToCart = useCallback((product, size = null, quantity = 1) => {
    const selectedSize = size || product.sizes[1] || product.sizes[0];
    const cartKey = `${product.id}-${selectedSize.ml}`;

    setCartItems(prev => {
      const existing = prev.find(item => item.cartKey === cartKey);
      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        ...product,
        cartKey,
        selectedSize,
        quantity,
        price: selectedSize.price,
      }];
    });
  }, []);

  const removeFromCart = useCallback((cartKey) => {
    setCartItems(prev => prev.filter(item => item.cartKey !== cartKey));
  }, []);

  const updateQuantity = useCallback((cartKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.cartKey === cartKey ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const addToWishlist = useCallback((product) => {
    setWishlistItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setPromoCode('');
    setDiscount(0);
  }, []);

  const applyPromoCode = useCallback((code) => {
    const codes = {
      'LUXURY10': 0.10,
      'WELCOME15': 0.15,
      'JPERFUME20': 0.20,
    };
    const discountRate = codes[code.toUpperCase()];
    if (discountRate) {
      setPromoCode(code);
      setDiscount(discountRate);
      return { success: true, message: `${discountRate * 100}% discount applied!` };
    }
    return { success: false, message: 'Invalid promo code.' };
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.round(subtotal * discount);
  const shipping = subtotal >= 999 ? 0 : 150;
  const total = subtotal - discountAmount + shipping;

  const value = {
    cartItems,
    wishlistItems,
    cartCount,
    subtotal,
    discountAmount,
    shipping,
    total,
    promoCode,
    discount,
    addToCart,
    removeFromCart,
    updateQuantity,
    addToWishlist,
    isInWishlist,
    clearCart,
    applyPromoCode,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
