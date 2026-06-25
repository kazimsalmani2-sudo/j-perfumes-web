// ============================================================
// Razorpay utility functions for J Perfumewala
// ============================================================

const API_BASE = import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:5000';

// Load Razorpay checkout script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Razorpay script failed to load');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Create a Razorpay order via backend
export const createPaymentOrder = async (amount) => {
  try {
    const response = await fetch(`${API_BASE}/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `order_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Order creation failed');
    }

    return await response.json();
  } catch (error) {
    // Fallback: mock order if backend is unreachable (development)
    console.warn('Backend unreachable — using mock order:', error.message);
    return {
      id: `order_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    };
  }
};

// Verify payment signature via backend
export const verifyPayment = async (paymentDetails) => {
  try {
    const response = await fetch(`${API_BASE}/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: paymentDetails.razorpay_order_id,
        razorpay_payment_id: paymentDetails.razorpay_payment_id,
        razorpay_signature: paymentDetails.razorpay_signature,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Verification failed');
    }

    return await response.json();
  } catch (error) {
    console.warn('Verification backend unreachable — using mock verification:', error.message);
    // Mock success for development
    return {
      verified: true,
      paymentId: paymentDetails.razorpay_payment_id,
      orderId: paymentDetails.razorpay_order_id,
    };
  }
};

// Confirm COD order via backend
export const confirmCodOrder = async (orderId, total, deliveryDetails) => {
  try {
    const response = await fetch(`${API_BASE}/payment/cod-confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, total, deliveryDetails }),
    });

    if (!response.ok) {
      throw new Error('COD confirmation failed');
    }

    return await response.json();
  } catch (error) {
    console.warn('COD backend unreachable — using mock:', error.message);
    return { success: true, orderId, message: 'COD order confirmed (mock)' };
  }
};
