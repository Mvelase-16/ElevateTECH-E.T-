import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  MapPin, 
  Lock,
  ShoppingBag
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, cartTotal, clearCart } = useCart();
  const { token, currentUser, isAuthenticated } = useAuth();

  // Retrieve checkout state passed from /checkout (or sessionStorage fallback)
  const stateData = location.state || {};
  const [pickupTime, setPickupTime] = useState(
    stateData.pickup_time || sessionStorage.getItem('unibites_pickup_time') || ''
  );
  const [customerPhone, setCustomerPhone] = useState(
    stateData.customer_phone || sessionStorage.getItem('unibites_phone') || currentUser?.phone || '0812345678'
  );
  const [customerName, setCustomerName] = useState(
    stateData.customer_name || sessionStorage.getItem('unibites_name') || currentUser?.name || 'WSU Student'
  );

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('Card'); // 'Card' or 'Cash on Pickup'
  const [cardDetails, setCardDetails] = useState({
    number: '',
    holder: customerName ? customerName.toUpperCase() : 'WSU STUDENT',
    expiry: '',
    cvv: ''
  });

  // State guards
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  // Save session state to prevent loss on reload
  useEffect(() => {
    if (pickupTime) sessionStorage.setItem('unibites_pickup_time', pickupTime);
    if (customerPhone) sessionStorage.setItem('unibites_phone', customerPhone);
    if (customerName) sessionStorage.setItem('unibites_name', customerName);
  }, [pickupTime, customerPhone, customerName]);

  // Format card number with spaces (e.g. 4532 8890 1234 5678)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardDetails(prev => ({ ...prev, number: formatted }));
  };

  // Format expiry with slash (MM/YY)
  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    let formatted = raw;
    if (raw.length >= 3) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardDetails(prev => ({ ...prev, expiry: formatted }));
  };

  // Auto-fill demo card
  const handleFillDemoCard = () => {
    setCardDetails({
      number: '4532 8890 1234 5678',
      holder: (customerName || 'WSU STUDENT').toUpperCase(),
      expiry: '12/28',
      cvv: '849'
    });
    setErrorMessage('');
  };

  // Process order and payment
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Anti-duplicate submission guard
    setErrorMessage('');

    // Cart validation
    if (cart.length === 0 && !successOrder) {
      setErrorMessage('Your cart is empty. Please add items before making payment.');
      return;
    }

    // Pickup slot validation
    if (!pickupTime) {
      setErrorMessage('Pickup time slot is missing. Please return to Checkout and select a slot.');
      return;
    }

    // Card validation
    if (paymentMethod === 'Card') {
      const cleanNum = cardDetails.number.replace(/\s/g, '');
      if (cleanNum.length < 13) {
        setErrorMessage('Please enter a valid card number or click "✨ Auto-Fill Demo Card".');
        return;
      }
      if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
        setErrorMessage('Please enter a valid card expiry date (MM/YY).');
        return;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        setErrorMessage('Please enter a 3 or 4 digit CVV security code.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        pickup_time: pickupTime,
        payment_method: paymentMethod,
        customer_phone: customerPhone,
        items: cart.map(it => ({ id: it.id, quantity: it.quantity }))
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment processing failed. Please try again.');
      }

      // Payment & Order Success!
      setSuccessOrder(data.order);
      clearCart();
      sessionStorage.removeItem('unibites_pickup_time');
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage(err.message || 'Payment failed. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================================================================
  // 1. ORDER CONFIRMATION VIEW (Shown upon successful payment)
  // ================================================================
  if (successOrder) {
    return (
      <div style={{ minHeight: '85vh', padding: '40px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '36px 28px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }} className="animate-fade-in">
          
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <CheckCircle2 size={40} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
            Payment Approved & Order Confirmed!
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Your meal ticket is now queued in the kitchen. Present your PIN at Counter 1 to collect.
          </p>

          {/* Ticket Card */}
          <div style={{
            backgroundColor: 'var(--primary-subtle)',
            borderRadius: '16px',
            padding: '22px',
            border: '2px dashed var(--primary-light)',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(122, 12, 46, 0.15)', paddingBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Ticket Order #</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)' }}>#{successOrder.order_number}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Status</span>
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--warning)', backgroundColor: 'var(--warning-bg)', padding: '3px 8px', borderRadius: '6px' }}>
                  QUEUED IN KITCHEN
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '14px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                YOUR 4-DIGIT COLLECTION PIN
              </span>
              <div style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '4px', color: 'var(--primary)' }}>
                #{successOrder.pickup_pin}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Show this PIN to cafeteria staff at Counter 1
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Pickup Window:</span>
              <strong style={{ color: 'var(--text-main)' }}>{successOrder.pickup_time}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Collection Point:</span>
              <strong style={{ color: 'var(--text-main)' }}>Main Cafeteria Counter 1</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
              <strong style={{ color: 'var(--text-main)' }}>{successOrder.payment_method}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700' }}>Total Paid:</span>
              <strong style={{ fontSize: '18px', color: 'var(--primary)' }}>R{parseFloat(successOrder.total_amount).toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/orders')}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '800',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              Track Order Live
            </button>

            <button
              onClick={() => navigate('/')}
              style={{
                padding: '14px 20px',
                backgroundColor: '#F3F4F6',
                color: 'var(--text-main)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700'
              }}
            >
              Order More
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty and user arrives here directly, redirect them to review or menu
  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '30px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--border)' }}>
        <ShoppingBag size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>No items pending payment</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Your cart is currently empty. Please select your meals from the menu.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            borderRadius: '10px',
            fontWeight: '700',
            textDecoration: 'none'
          }}
        >
          Explore Campus Menu
        </Link>
      </div>
    );
  }

  // ================================================================
  // 2. MAIN PAYMENT FORM VIEW
  // ================================================================
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px 80px', width: '100%' }}>
      {/* Back button to return to Review (cart preserved) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/checkout')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            fontWeight: '700',
            fontSize: '14px',
            padding: '8px 14px',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border)',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          <span>← Back to Order Review</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600' }}>
          <Lock size={14} color="var(--success)" />
          <span>256-Bit SSL Encrypted Payment</span>
        </div>
      </div>

      {/* TOP SUMMARY BANNER */}
      <div style={{
        backgroundColor: 'var(--primary)',
        color: '#FFFFFF',
        borderRadius: '18px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '12px', opacity: 0.85, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Payment Amount Due
          </span>
          <div style={{ fontSize: '32px', fontWeight: '900', marginTop: '2px', color: '#FFFFFF' }}>
            R{cartTotal.toFixed(2)}
          </div>
          <span style={{ fontSize: '13px', opacity: 0.9 }}>
            Includes meal prices + standard packaging container
          </span>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <Clock size={16} color="#FCD34D" />
            <span>Pickup Window: <strong style={{ color: '#FCD34D' }}>{pickupTime || '8:00 AM – 7:00 PM'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <MapPin size={16} color="#FCD34D" />
            <span>Collection Point: <strong>Counter 1 (Express Lane)</strong></span>
          </div>
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div style={{
          backgroundColor: 'var(--danger-bg)',
          color: 'var(--danger)',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '24px',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid Layout: Card Graphic & Form */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>

        {/* LEFT: Payment Options & Interactive Virtual Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Method Selector Tabs */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '14px' }}>
              Choose Payment Method
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: paymentMethod === 'Card' ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: paymentMethod === 'Card' ? 'var(--primary-subtle)' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: paymentMethod === 'Card' ? 'var(--primary)' : 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                <CreditCard size={18} />
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Pickup')}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: paymentMethod === 'Cash on Pickup' ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: paymentMethod === 'Cash on Pickup' ? 'var(--primary-subtle)' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: paymentMethod === 'Cash on Pickup' ? 'var(--primary)' : 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                <DollarSign size={18} />
                <span>Cash on Pickup</span>
              </button>
            </div>
          </div>

          {/* Virtual Card Graphic */}
          {paymentMethod === 'Card' && (
            <div style={{
              background: 'linear-gradient(135deg, #7A0C2E 0%, #3B0011 100%)',
              borderRadius: '20px',
              padding: '24px 22px',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background emblem decoration */}
              <div style={{
                position: 'absolute',
                right: '-20px',
                bottom: '-20px',
                fontSize: '120px',
                opacity: 0.08,
                fontWeight: '900',
                pointerEvents: 'none'
              }}>
                UB
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '1.5px', color: '#FCD34D' }}>
                  UNIBITES STUDENT CARD
                </span>
                <ShieldCheck size={24} color="#FCD34D" />
              </div>

              {/* Masked Card Number */}
              <div style={{
                fontSize: '20px',
                fontWeight: '800',
                letterSpacing: '3px',
                marginBottom: '20px',
                fontFamily: 'monospace'
              }}>
                {cardDetails.number || '•••• •••• •••• ••••'}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '13px' }}>
                <div>
                  <span style={{ fontSize: '9px', opacity: 0.7, display: 'block', letterSpacing: '0.5px' }}>CARDHOLDER NAME</span>
                  <strong style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {cardDetails.holder || customerName || 'STUDENT NAME'}
                  </strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '9px', opacity: 0.7, display: 'block', letterSpacing: '0.5px' }}>EXPIRES</span>
                  <strong style={{ letterSpacing: '1px' }}>{cardDetails.expiry || 'MM/YY'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Payment Form Fields & Submission */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)'
        }}>
          {paymentMethod === 'Card' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)' }}>
                  Card Details
                </h3>
                <button
                  type="button"
                  onClick={handleFillDemoCard}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px dashed var(--accent)',
                    backgroundColor: 'var(--warning-bg)',
                    color: 'var(--accent)',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={13} />
                  <span>Auto-Fill Demo Card</span>
                </button>
              </div>

              <form onSubmit={handleProcessPayment}>
                {/* Name on Card */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Cardholder Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nikelwa Sophazi"
                    value={cardDetails.holder}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, holder: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      fontSize: '14px',
                      backgroundColor: '#FAFAFA'
                    }}
                  />
                </div>

                {/* Card Number */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Card Number (Visa / Mastercard)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="4532 8890 1234 5678"
                      value={cardDetails.number}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        fontSize: '14px',
                        backgroundColor: '#FAFAFA',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>

                {/* Expiry & CVV */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        fontSize: '14px',
                        backgroundColor: '#FAFAFA'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      CVV / Security Code
                    </label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        fontSize: '14px',
                        backgroundColor: '#FAFAFA'
                      }}
                    />
                  </div>
                </div>

                {/* Submit Payment CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    borderRadius: '14px',
                    fontSize: '16px',
                    fontWeight: '800',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>{isSubmitting ? 'Authorizing Payment...' : 'Authorize & Pay'}</span>
                  <span>R{cartTotal.toFixed(2)}</span>
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px' }}>
                Cash on Collection
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                You can reserve your pickup slot and meal order right now, and pay in cash directly to the cashier at <strong>Counter 1</strong> when picking up your order.
              </p>

              <div style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '22px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Due at Cashier:</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '16px' }}>R{cartTotal.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Pickup Window:</span>
                  <strong>{pickupTime || '8:00 AM – 7:00 PM'}</strong>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleProcessPayment}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <span>{isSubmitting ? 'Confirming Reservation...' : 'Confirm Cash Reservation'}</span>
                <span>R{cartTotal.toFixed(2)}</span>
              </button>
            </div>
          )}

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>
            🔒 Safe & secure campus transaction. Instant 4-digit Collection PIN will be issued.
          </p>
        </div>

      </div>
    </div>
  );
}
