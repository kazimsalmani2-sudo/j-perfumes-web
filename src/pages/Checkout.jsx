import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ChevronRight, Info, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { loadRazorpayScript, createPaymentOrder, verifyPayment } from '../utils/razorpay';
import { sendOtpApi, verifyOtpApi } from '../utils/otp';
import './Checkout.css';

const STEPS = ['Delivery', 'OTP Verification', 'Payment', 'Confirmation'];

const BANKS = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda',
  'Union Bank of India', 'Canara Bank', 'IndusInd Bank',
  'YES Bank', 'Federal Bank', 'IDBI Bank', 'Central Bank of India',
];

// Card network logo SVG components
function VisaLogo() {
  return (
    <svg viewBox="0 0 60 38" className="card-logo" aria-label="Visa">
      <rect width="60" height="38" rx="4" fill="#1A1F71" />
      <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="Arial" fontStyle="italic">VISA</text>
    </svg>
  );
}
function MastercardLogo() {
  return (
    <svg viewBox="0 0 60 38" className="card-logo" aria-label="Mastercard">
      <rect width="60" height="38" rx="4" fill="#252525" />
      <circle cx="24" cy="19" r="11" fill="#EB001B" />
      <circle cx="36" cy="19" r="11" fill="#F79E1B" />
      <path d="M30 11.3A11 11 0 0136 19a11 11 0 01-6 7.7A11 11 0 0124 19a11 11 0 016-7.7z" fill="#FF5F00" />
    </svg>
  );
}
function AmexLogo() {
  return (
    <svg viewBox="0 0 60 38" className="card-logo" aria-label="American Express">
      <rect width="60" height="38" rx="4" fill="#016FD0" />
      <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">AMERICAN</text>
      <text x="50%" y="78%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">EXPRESS</text>
    </svg>
  );
}
function MaestroLogo() {
  return (
    <svg viewBox="0 0 60 38" className="card-logo" aria-label="Maestro">
      <rect width="60" height="38" rx="4" fill="#fff" stroke="#ddd" strokeWidth="1" />
      <circle cx="24" cy="19" r="11" fill="#E5001B" opacity="0.9" />
      <circle cx="36" cy="19" r="11" fill="#007AC2" opacity="0.9" />
      <text x="50%" y="76%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">Maestro</text>
    </svg>
  );
}
function RupayLogo() {
  return (
    <svg viewBox="0 0 60 38" className="card-logo" aria-label="RuPay">
      <rect width="60" height="38" rx="4" fill="#fff" stroke="#ddd" strokeWidth="1" />
      <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle" fill="#1A5276" fontSize="13" fontWeight="bold" fontFamily="Arial">RuPay</text>
    </svg>
  );
}
function DinersLogo() {
  return (
    <svg viewBox="0 0 60 38" className="card-logo" aria-label="Diners Club">
      <rect width="60" height="38" rx="4" fill="#fff" stroke="#ddd" strokeWidth="1" />
      <circle cx="30" cy="19" r="13" fill="none" stroke="#00447C" strokeWidth="1.5" />
      <circle cx="25" cy="19" r="8" fill="#00447C" />
      <circle cx="35" cy="19" r="8" fill="#00447C" />
    </svg>
  );
}

// UPI Logo
function UpiLogo() {
  return (
    <span className="upi-brand-logo">
      <span className="upi-u">U</span>
      <span className="upi-p">P</span>
      <span className="upi-i">I</span>
      <span className="upi-arrow">▶</span>
    </span>
  );
}

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [orderId] = useState(`JP${Math.floor(10000 + Math.random() * 90000)}`);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [selectedBank, setSelectedBank] = useState('');
  const [giftCode, setGiftCode] = useState('');
  const [codConfirmed, setCodConfirmed] = useState(false);

  const { cartItems, total, subtotal, shipping, discountAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', pincode: '', state: '',
  });

  // OTP Verification States
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [otpInputs, setOtpInputs] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  // Pre-fill form with user's saved default address
  useEffect(() => {
    const userEmail = user?.email || 'guest';
    const storageKey = `saved_addresses_${userEmail}`;
    let defaultAddr = null;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      defaultAddr = saved.find(a => a.isDefault) || null;
    } catch (e) {}

    setForm({
      name: defaultAddr?.name || user?.displayName || '',
      email: user?.email || '',
      phone: defaultAddr?.phone || '',
      address: defaultAddr?.address || '',
      city: defaultAddr?.city || '',
      pincode: defaultAddr?.pincode || '',
      state: defaultAddr?.state || '',
    });
  }, [user]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Save address + send OTP to proceed to step 1
  const handleDelivery = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');

    // Save address to user profile
    const userEmail = user?.email || 'guest';
    const storageKey = `saved_addresses_${userEmail}`;
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch (err) {}
    const exists = saved.some(
      item => item.address.toLowerCase() === form.address.toLowerCase() && item.pincode === form.pincode
    );
    if (!exists) {
      saved.forEach(item => { item.isDefault = false; });
      saved.unshift({
        id: Date.now(),
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        state: form.state,
        isDefault: true,
      });
      localStorage.setItem(storageKey, JSON.stringify(saved));
    }

    // Send OTP
    try {
      const res = await sendOtpApi(form.phone, form.email);
      if (res.success && res.emailSent) {
        setEmailSent(true);
        setOtpInputs(['', '', '', '']);
        setStep(1);
        setCountdown(30);
        window.scrollTo(0, 0);
      } else {
        // Email failed — show error, stay on delivery step
        setOtpError(res.error || 'Failed to send verification code. Please check your email and try again.');
      }
    } catch (err) {
      setOtpError('Error sending OTP. Please check your network connection.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otpInputs.join('');
    if (otpValue.length < 4) {
      setOtpError('Please enter the complete 4-digit code.');
      return;
    }
    setOtpVerifying(true);
    setOtpError('');
    try {
      const result = await verifyOtpApi(form.phone, form.email, otpValue);
      if (result.verified) {
        setStep(2);
        window.scrollTo(0, 0);
      } else {
        setOtpError(result.error || 'Incorrect OTP code. Please try again.');
      }
    } catch (err) {
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await sendOtpApi(form.phone, form.email);
      if (res.success && res.emailSent) {
        setEmailSent(true);
        setOtpError('');
        setOtpInputs(['', '', '', '']);
        setCountdown(30);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      } else {
        setOtpError(res.error || 'Failed to resend verification code. Please try again.');
      }
    } catch (err) {
      setOtpError('Error resending verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newInputs = [...otpInputs];
    newInputs[index] = value.slice(-1);
    setOtpInputs(newInputs);
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pasted)) {
      setOtpInputs(pasted.split(''));
      inputRefs.current[3]?.focus();
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentError('');

    const saveOrderToHistory = () => {
      const userEmail = user?.email || 'guest';
      const storageKey = `order_history_${userEmail}`;
      let savedOrders = [];
      try { savedOrders = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch (err) {}
      
      const newOrder = {
        id: orderId,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
        total: total,
        subtotal: subtotal,
        shipping: shipping,
        discountAmount: discountAmount || 0,
        status: 'In Transit',
        method: selectedPayment === 'cod' ? 'Cash on Delivery' : selectedPayment === 'card' ? 'Card Payment' : selectedPayment === 'upi' ? 'UPI' : 'Net Banking',
        deliveryDetails: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          pincode: form.pincode,
          state: form.state,
        },
        items: cartItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize?.ml || item.size || '',
          image: item.image,
        })),
      };
      
      savedOrders.unshift(newOrder);
      localStorage.setItem(storageKey, JSON.stringify(savedOrders));
    };

    if (selectedPayment === 'cod') {
      setTimeout(() => {
        setPaymentSuccess(true);
        saveOrderToHistory();
        setTimeout(() => { setStep(3); clearCart(); window.scrollTo(0, 0); }, 800);
      }, 1200);
      return;
    }

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentError('Payment gateway failed to load. Please check your internet connection.');
        setPaymentLoading(false);
        return;
      }

      const order = await createPaymentOrder(total);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE',
        amount: order.amount,
        currency: order.currency,
        name: 'J Perfumewala',
        description: `Order #${orderId}`,
        image: '/logo.jpg',
        order_id: order.id,
        prefill: {
          name: form.name || user?.displayName || '',
          email: form.email || user?.email || '',
          contact: form.phone || '',
        },
        theme: { color: '#B8960C' },
        handler: async (response) => {
          try {
            const verification = await verifyPayment(response);
            if (verification.verified) {
              setPaymentSuccess(true);
              sessionStorage.setItem('paymentDetails', JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: total,
                method: selectedPayment,
                timestamp: new Date().toISOString(),
              }));
              saveOrderToHistory();
              setTimeout(() => { setStep(3); clearCart(); window.scrollTo(0, 0); }, 800);
            } else {
              setPaymentError('Payment verification failed. Please contact support.');
              setPaymentLoading(false);
            }
          } catch {
            setPaymentError('Payment verification failed. Please try again.');
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            setPaymentError('Payment was cancelled. Please try again.');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        setPaymentError(`Payment failed: ${response.error.description}`);
        setPaymentLoading(false);
      });
      razorpay.open();

    } catch {
      setPaymentError('Something went wrong. Please try again.');
      setPaymentLoading(false);
    }
  };

  const selectPayment = (id) => {
    setSelectedPayment(id);
    setPaymentError('');
  };

  return (
    <main className="checkout-page">
      <div className="container">

        {/* Steps */}
        <div className="checkout-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`checkout-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="step-circle">{i < step ? '✓' : i + 1}</div>
              <span className="step-label">{s}</span>
              {i < STEPS.length - 1 && <ChevronRight size={16} className="step-arrow" />}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">

            {/* ============ STEP 0: DELIVERY ============ */}
            {step === 0 && (
              <form onSubmit={handleDelivery} className="checkout-form">
                <h2 className="checkout-form-title">Delivery Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input id="phone" name="phone" type="tel" required value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group form-full">
                    <label htmlFor="address">Address</label>
                    <input id="address" name="address" type="text" required value={form.address} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input id="city" name="city" type="text" required value={form.city} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="pincode">Pincode</label>
                    <input id="pincode" name="pincode" type="text" required value={form.pincode} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input id="state" name="state" type="text" required value={form.state} onChange={handleChange} />
                  </div>
                </div>
                <button type="submit" className="btn btn-gold checkout-submit" id="delivery-next" disabled={otpLoading}>
                  {otpLoading ? <><span className="amz-spinner" /> SENDING OTP...</> : 'CONTINUE TO VERIFICATION →'}
                </button>
              </form>
            )}

            {/* ============ STEP 1: OTP VERIFICATION ============ */}
            {step === 1 && (
              <form onSubmit={handleVerifyOtp} className="checkout-form otp-form">
                <div className="otp-header">
                  <button type="button" className="btn-back" onClick={() => { setStep(0); setOtpError(''); }}>
                    <ArrowLeft size={16} /> Edit Address
                  </button>
                  <div className="otp-secure-badge">
                    <ShieldCheck size={16} /> Secure Verification
                  </div>
                </div>

                <div className="otp-body">
                  <h2 className="checkout-form-title">Verify Your Identity</h2>

                  <p className="otp-description">
                    We've sent a 4-digit verification code to <strong>{form.email}</strong>. Please check your inbox and spam folder.
                  </p>

                  {otpError && (
                    <div className="amz-alert error">
                      <Info size={15} /> {otpError}
                    </div>
                  )}




                  <div className="otp-digits-container">
                    {otpInputs.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={el => inputRefs.current[idx] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="otp-digit-input"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  <div className="otp-timer-container">
                    {countdown > 0 ? (
                      <span className="otp-timer-text">Resend code in <strong>0:{countdown.toString().padStart(2, '0')}</strong></span>
                    ) : (
                      <button type="button" className="btn-resend" onClick={handleResendOtp} disabled={otpLoading}>
                        {otpLoading ? <RefreshCw size={14} className="spin" /> : 'Resend OTP'}
                      </button>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn btn-gold checkout-submit" id="otp-verify-btn" disabled={otpVerifying}>
                  {otpVerifying ? 'VERIFYING...' : 'VERIFY & CONTINUE →'}
                </button>
              </form>
            )}

            {/* ============ STEP 2: PAYMENT ============ */}
            {step === 2 && (
              <form onSubmit={handlePayment} className="checkout-form amz-payment-form">

                {/* Delivery info strip */}
                <div className="amz-delivery-strip">
                  <div className="amz-delivery-info">
                    <strong>Delivering to {form.name || 'You'}</strong>
                    <span className="amz-delivery-address">
                      {[form.address, form.city, form.state, form.pincode].filter(Boolean).join(', ') || 'Please add your delivery address'}
                    </span>
                    <button type="button" className="amz-change-link" onClick={() => { setStep(0); setPaymentError(''); }}>
                      Change
                    </button>
                  </div>
                </div>

                {/* Error / Success */}
                {paymentError && (
                  <div className="amz-alert error"><Info size={15} /> {paymentError}</div>
                )}
                {paymentSuccess && (
                  <div className="amz-alert success">✓ {selectedPayment === 'cod' ? 'Order confirmed! Redirecting...' : 'Payment successful! Redirecting...'}</div>
                )}

                {/* ---- SECTION: Gift Card / Balance ---- */}
                <div className="amz-section">
                  <h2 className="amz-section-title">Payment method</h2>

                  <div className="amz-subsection">
                    <h3 className="amz-subsection-title">Your available balance</h3>

                    {/* Amazon Pay row (disabled, decorative) */}
                    <div className="amz-pay-row disabled">
                      <input type="radio" className="amz-radio" disabled />
                      <div className="amz-pay-row-body">
                        <span className="amz-pay-label"><strong>J Wallet Balance ₹0.00</strong> — Unavailable</span>
                        <div className="amz-pay-hint">
                          <Info size={14} className="amz-info-icon" />
                          <span>Insufficient balance.</span>
                        </div>
                      </div>
                    </div>

                    {/* Gift code */}
                    <div className="amz-giftcode-row">
                      <span className="amz-plus">+</span>
                      <input
                        type="text"
                        className="amz-code-input"
                        placeholder="Enter Code"
                        value={giftCode}
                        onChange={e => setGiftCode(e.target.value)}
                        id="gift-code-input"
                      />
                      <button type="button" className="amz-apply-btn" id="apply-code-btn">Apply</button>
                    </div>
                  </div>

                  <div className="amz-section-divider" />

                  <div className="amz-subsection">
                    <h3 className="amz-subsection-title">Another payment method</h3>

                    {/* ---- Credit or Debit Card ---- */}
                    <div
                      className={`amz-method-row ${selectedPayment === 'card' ? 'selected' : ''}`}
                      onClick={() => selectPayment('card')}
                      id="payment-card"
                    >
                      <input
                        type="radio"
                        className="amz-radio"
                        name="payment"
                        checked={selectedPayment === 'card'}
                        onChange={() => selectPayment('card')}
                        id="radio-card"
                      />
                      <div className="amz-method-body">
                        <label htmlFor="radio-card" className="amz-method-label">
                          <strong>Credit or debit card</strong>
                        </label>
                        <div className="amz-card-logos">
                          <VisaLogo />
                          <MastercardLogo />
                          <AmexLogo />
                          <DinersLogo />
                          <MaestroLogo />
                          <RupayLogo />
                        </div>
                        {selectedPayment === 'card' && (
                          <div className="amz-method-expanded">
                            <p className="amz-method-note">
                              <Info size={14} className="amz-info-icon" />
                              You will be redirected to Razorpay's secure page to enter your card details.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ---- Net Banking ---- */}
                    <div
                      className={`amz-method-row ${selectedPayment === 'netbanking' ? 'selected' : ''}`}
                      onClick={() => selectPayment('netbanking')}
                      id="payment-netbanking"
                    >
                      <input
                        type="radio"
                        className="amz-radio"
                        name="payment"
                        checked={selectedPayment === 'netbanking'}
                        onChange={() => selectPayment('netbanking')}
                        id="radio-netbanking"
                      />
                      <div className="amz-method-body">
                        <label htmlFor="radio-netbanking" className="amz-method-label">
                          <strong>Net Banking</strong>
                        </label>
                        <div className="amz-netbanking-select-row" onClick={e => e.stopPropagation()}>
                          <select
                            className="amz-bank-select"
                            value={selectedBank}
                            onChange={e => { setSelectedBank(e.target.value); selectPayment('netbanking'); }}
                            id="bank-select"
                          >
                            <option value="">Choose an Option ∨</option>
                            {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        {selectedPayment === 'netbanking' && selectedBank && (
                          <div className="amz-method-expanded">
                            <p className="amz-method-note">
                              <Info size={14} className="amz-info-icon" />
                              You will be redirected to {selectedBank}'s secure portal to complete the payment.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ---- Scan and Pay with UPI ---- */}
                    <div
                      className={`amz-method-row ${selectedPayment === 'upi' ? 'selected upi-selected' : ''}`}
                      onClick={() => selectPayment('upi')}
                      id="payment-upi"
                    >
                      <input
                        type="radio"
                        className="amz-radio"
                        name="payment"
                        checked={selectedPayment === 'upi'}
                        onChange={() => selectPayment('upi')}
                        id="radio-upi"
                      />
                      <div className="amz-method-body">
                        <label htmlFor="radio-upi" className="amz-method-label">
                          <strong>Scan and Pay with</strong> <UpiLogo />
                        </label>
                        {selectedPayment === 'upi' && (
                          <div className="amz-method-expanded">
                            <p className="amz-method-note">
                              <Info size={14} className="amz-info-icon" />
                              You will need to Scan the QR code on the payment page to complete the payment.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ---- EMI ---- */}
                    <div
                      className={`amz-method-row ${selectedPayment === 'emi' ? 'selected' : ''}`}
                      onClick={() => selectPayment('emi')}
                      id="payment-emi"
                    >
                      <input
                        type="radio"
                        className="amz-radio"
                        name="payment"
                        checked={selectedPayment === 'emi'}
                        onChange={() => selectPayment('emi')}
                        id="radio-emi"
                      />
                      <div className="amz-method-body">
                        <label htmlFor="radio-emi" className="amz-method-label">
                          <strong>EMI</strong>
                        </label>
                        {selectedPayment === 'emi' && (
                          <div className="amz-method-expanded">
                            <p className="amz-method-note">
                              <Info size={14} className="amz-info-icon" />
                              EMI options will be available on the payment page based on your card and bank.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ---- Cash on Delivery ---- */}
                    <div
                      className={`amz-method-row ${selectedPayment === 'cod' ? 'selected' : ''}`}
                      onClick={() => selectPayment('cod')}
                      id="payment-cod"
                    >
                      <input
                        type="radio"
                        className="amz-radio"
                        name="payment"
                        checked={selectedPayment === 'cod'}
                        onChange={() => selectPayment('cod')}
                        id="radio-cod"
                      />
                      <div className="amz-method-body">
                        <label htmlFor="radio-cod" className="amz-method-label">
                          <strong>Cash on Delivery/Pay on Delivery</strong>
                        </label>
                        <div className="amz-method-subtitle">
                          Cash, UPI and Cards accepted.{' '}
                          <span className="amz-link">Know more.</span>
                        </div>
                        {selectedPayment === 'cod' && (
                          <div className="amz-method-expanded">
                            <label className="amz-cod-confirm">
                              <input
                                type="checkbox"
                                checked={codConfirmed}
                                onChange={e => setCodConfirmed(e.target.checked)}
                                id="cod-confirm"
                              />
                              <span>I agree to pay ₹{total.toLocaleString()} upon delivery</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Use this payment method button */}
                <div className="amz-pay-footer">
                  <button
                    type="submit"
                    className="amz-use-payment-btn"
                    id="pay-btn"
                    disabled={paymentLoading || paymentSuccess || (selectedPayment === 'cod' && !codConfirmed)}
                  >
                    {paymentLoading
                      ? <><span className="amz-spinner" /> Processing...</>
                      : 'Use this payment method'}
                  </button>
                </div>

              </form>
            )}

            {/* ============ STEP 3: CONFIRMATION ============ */}
            {step === 3 && (
              <div className="confirmation-screen">
                <div className="confirm-icon">
                  <CheckCircle size={64} color="var(--gold-dark)" />
                </div>
                <h2 className="confirm-title">Order Confirmed!</h2>
                <p className="confirm-subtitle">
                  Thank you for your order. We'll send a confirmation to your email shortly.
                </p>
                <div className="confirm-order-id">
                  Order ID: <strong>#{orderId}</strong>
                </div>
                <p className="confirm-delivery">
                  Expected delivery: 3–5 business days
                </p>
                <div className="confirm-actions">
                  <Link to="/shop" className="btn btn-gold">CONTINUE SHOPPING</Link>
                  <a href={`https://wa.me/918286679918?text=My order ID is ${orderId}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                    TRACK ON WHATSAPP
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ============ ORDER SUMMARY SIDEBAR ============ */}
          {step < 3 && (
            <div className="checkout-sidebar">
              <h3 className="summary-title">YOUR ORDER</h3>
              <div className="checkout-items">
                {cartItems.map(item => (
                  <div key={item.cartKey} className="checkout-item">
                    <img src={item.image} alt={item.name} />
                    <div className="checkout-item-info">
                      <div className="checkout-item-name">{item.name}</div>
                      <div className="checkout-item-meta">{item.selectedSize.ml}ml × {item.quantity}</div>
                    </div>
                    <div className="checkout-item-price">₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="summary-rows">
                <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="summary-row"><span>Shipping</span><span className={shipping === 0 ? 'free-shipping' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                {discountAmount > 0 && <div className="summary-row discount"><span>Discount</span><span>-₹{discountAmount.toLocaleString()}</span></div>}
                <div className="summary-divider" />
                <div className="summary-row total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
