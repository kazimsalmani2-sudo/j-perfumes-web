import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    // Get payment details from session or state
    let details = state;
    
    if (!details) {
      const stored = sessionStorage.getItem('paymentDetails');
      if (stored) {
        details = JSON.parse(stored);
      }
    }

    if (!details) {
      // No payment details - redirect back to checkout
      navigate('/checkout');
      return;
    }

    setPaymentDetails(details);
    setOrderId(`JP${Math.floor(10000 + Math.random() * 90000)}`);

    // Clear stored payment details after reading
    sessionStorage.removeItem('paymentDetails');
  }, [state, navigate]);

  if (!paymentDetails) {
    return null;
  }

  const whatsappMessage = `Hi! My order ID is ${orderId}. Payment ID: ${paymentDetails.paymentId}. Please track my order.`;
  const whatsappUrl = `https://wa.me/918286679918?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="about-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <section className="section" style={{ padding: '60px 20px' }}>
        <div className="container">
          <div style={{
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto',
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '12px',
            padding: '50px 40px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            {/* Success Icon */}
            <div style={{ marginBottom: '30px' }}>
              <CheckCircle size={72} color="var(--gold-dark)" />
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '42px',
              fontWeight: '400',
              marginBottom: '16px',
              color: '#1f2937'
            }}>
              Order Confirmed! 🎉
            </h1>

            {/* Subtitle */}
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '16px',
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              Thank you for your order. We'll send a confirmation email shortly with tracking details.
            </p>

            {/* Order ID */}
            <div style={{
              background: 'var(--off-white)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '30px'
            }}>
              <p style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px'
              }}>
                Order ID
              </p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: '600',
                color: 'var(--gold-dark)'
              }}>
                #{orderId}
              </p>
            </div>

            {/* Payment Details */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #dcfce7',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '30px',
              fontSize: '14px',
              color: '#166534'
            }}>
              <div style={{ marginBottom: '8px' }}>
                ✓ <strong>Payment Verified</strong>
              </div>
              <div>
                Amount Paid: <strong>₹{paymentDetails.amount?.toLocaleString()}</strong>
              </div>
              {paymentDetails.paymentId && (
                <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
                  Payment ID: {paymentDetails.paymentId.slice(-10)}
                </div>
              )}
            </div>

            {/* Expected Delivery */}
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '14px',
              marginBottom: '30px'
            }}>
              📦 <strong>Expected delivery:</strong> 3-5 business days
            </p>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexDirection: 'column'
            }}>
              <Link 
                to="/shop" 
                className="btn btn-gold"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  padding: '14px 24px',
                  textAlign: 'center',
                  borderRadius: '4px',
                  fontWeight: '700',
                  letterSpacing: '1px'
                }}
              >
                CONTINUE SHOPPING
              </Link>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  padding: '14px 24px',
                  textAlign: 'center',
                  border: '1px solid var(--border-light)',
                  borderRadius: '4px',
                  fontWeight: '700',
                  letterSpacing: '1px',
                  color: 'var(--text-primary)',
                  backgroundColor: 'transparent'
                }}
              >
                TRACK ON WHATSAPP
              </a>
            </div>

            {/* Footer Note */}
            <p style={{
              marginTop: '30px',
              paddingTop: '30px',
              borderTop: '1px solid var(--border-light)',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              A confirmation email has been sent. If you don't receive it, please check your spam folder.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
