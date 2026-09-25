import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  MapPin, 
  Clock, 
  Plus, 
  Minus, 
  Trash2, 
  AlertCircle, 
  ShoppingBag,
  ShieldCheck,
  User,
  Phone
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartCount, cartSubtotal, serviceFee, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { currentUser, isAuthenticated } = useAuth();

  // Time Slots
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(
    sessionStorage.getItem('unibites_pickup_time') || ''
  );
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);

  // Customer Contact Info
  const [phone, setPhone] = useState(
    sessionStorage.getItem('unibites_phone') || currentUser?.phone || '0812345678'
  );
  const [customerName, setCustomerName] = useState(
    sessionStorage.getItem('unibites_name') || currentUser?.name || ''
  );

  const [errorMessage, setErrorMessage] = useState('');

  // Sync user details when auth loads
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!phone && currentUser.phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Fetch live time slots
  useEffect(() => {
    async function fetchSlots() {
      setIsLoadingSlots(true);
      try {
        const res = await fetch(`${API_BASE}/time-slots`);
        if (res.ok) {
          const data = await res.json();
          setTimeSlots(data);

          // Auto-select first available future slot if none selected
          const firstAvailable = data.find(s => s.is_available);
          if (firstAvailable && !selectedTimeSlot) {
            setSelectedTimeSlot(firstAvailable.slot_time);
          }
        }
      } catch (err) {
        console.error('Error fetching time slots:', err);
      } finally {
        setIsLoadingSlots(false);
      }
    }

    fetchSlots();
  }, []);

  // Save changes to sessionStorage for resilience
  useEffect(() => {
    if (selectedTimeSlot) sessionStorage.setItem('unibites_pickup_time', selectedTimeSlot);
    if (phone) sessionStorage.setItem('unibites_phone', phone);
    if (customerName) sessionStorage.setItem('unibites_name', customerName);
  }, [selectedTimeSlot, phone, customerName]);

  const handleProceedToPayment = () => {
    setErrorMessage('');

    // 1. Guard against empty cart
    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Please add delicious meals from the campus menu.');
      return;
    }

    // 2. Validate time slot
    if (!selectedTimeSlot) {
      setErrorMessage('Please choose a pickup time window between 8:00 AM and 7:00 PM.');
      return;
    }

    const chosenSlot = timeSlots.find(s => s.slot_time === selectedTimeSlot);
    if (chosenSlot && chosenSlot.is_past) {
      setErrorMessage(`The ${selectedTimeSlot} time window has already passed today. Please choose an upcoming window.`);
      return;
    }
    if (chosenSlot && chosenSlot.is_full) {
      setErrorMessage(`The ${selectedTimeSlot} pickup window has reached its maximum capacity. Please pick another slot.`);
      return;
    }

    // Navigate to dedicated /payment page with preserved state (Cart remains completely untouched)
    navigate('/payment', {
      state: {
        pickup_time: selectedTimeSlot,
        customer_phone: currentUser?.phone || phone || '0812345678',
        customer_name: currentUser?.name || customerName || 'WSU Student'
      }
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 80px', width: '100%' }}>
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/')}
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
            <span>Back to Menu</span>
          </button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              Order Review & Pickup
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Step 1 of 2: Review your meal selection and select your collection slot
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '700', fontSize: '13px' }}>
          <span>Next: Payment</span>
          <ArrowRight size={16} />
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

      {/* Responsive Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '28px',
        alignItems: 'start'
      }}>

        {/* ======================================================== */}
        {/* LEFT COLUMN: Pickup Location, Contact, Pickup Slot Picker */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 1. Collection Location Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '8px' }}>
              <MapPin size={20} />
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Campus Pickup Counter</h3>
            </div>
            <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
              Main Cafeteria Counter 1 (Express Student Lane)
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Walter Sisulu University • Show your 4-digit Collection PIN at the counter
            </p>
          </div>

          {/* 2. Pickup Time Window Selector (8:00 AM – 7:00 PM, 30-min intervals) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <Clock size={18} />
                <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Select Pickup Window</h3>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                8:00 AM – 7:00 PM
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Select when you plan to collect your order at Counter 1 to skip the queues.
            </p>

            {isLoadingSlots ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>
                Checking live kitchen pickup slot availability...
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                gap: '8px',
                maxHeight: '280px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}>
                {timeSlots.map(slot => {
                  const isSelected = selectedTimeSlot === slot.slot_time;
                  const isPast = slot.is_past;
                  const isFull = slot.is_full;
                  const isDisabled = !slot.is_available;

                  let badgeText = `${slot.spots_remaining} left`;
                  let badgeColor = 'var(--success)';
                  if (isPast) {
                    badgeText = 'Passed';
                    badgeColor = 'var(--text-light)';
                  } else if (isFull) {
                    badgeText = 'FULL';
                    badgeColor = 'var(--danger)';
                  } else if (slot.spots_remaining <= 3) {
                    badgeColor = 'var(--warning)';
                  }

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedTimeSlot(slot.slot_time);
                          setErrorMessage('');
                        }
                      }}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: '2px solid',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: isSelected 
                          ? 'var(--primary-subtle)' 
                          : (isDisabled ? '#F9FAFB' : '#FFFFFF'),
                        opacity: isDisabled ? 0.45 : 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '800',
                        color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {slot.slot_time.split(' - ')[0]}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: badgeColor,
                        fontWeight: '700',
                        marginTop: '2px'
                      }}>
                        {badgeText}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Order Items, Sticky Bill Summary, Proceed CTA */}
        {/* ======================================================== */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          position: 'sticky',
          top: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
              Order Review
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>
              {cartCount} {cartCount === 1 ? 'Meal' : 'Meals'}
            </span>
          </div>

          {/* Cart items list */}
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
              <ShoppingBag size={40} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
              <p style={{ fontSize: '14px', fontWeight: '600' }}>Your cart is empty</p>
              <Link to="/" style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: '700', textDecoration: 'underline' }}>
                Browse campus menu
              </Link>
            </div>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '18px', paddingRight: '4px' }}>
              {cart.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'; }}
                    />
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', maxWidth: '170px', lineHeight: 1.2 }}>
                        {item.name}
                      </h4>
                      <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>
                        R{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        backgroundColor: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: '700', width: '18px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        backgroundColor: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      style={{ color: '#DC2626', marginLeft: '4px', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pricing Breakdown */}
          {cart.length > 0 && (
            <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span>Subtotal</span>
                <span>R{cartSubtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                <span>Packaging & Container Fee</span>
                <span>R{serviceFee.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '18px',
                fontWeight: '900',
                color: 'var(--primary)',
                borderTop: '1px solid var(--border)',
                paddingTop: '12px'
              }}>
                <span>Total Amount</span>
                <span>R{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Selected Slot Display */}
          {selectedTimeSlot && (
            <div style={{
              backgroundColor: 'var(--primary-subtle)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px'
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pickup Window:</span>
              <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>{selectedTimeSlot}</strong>
            </div>
          )}

          {/* Proceed to Payment CTA */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleProceedToPayment}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: cart.length === 0 ? '#D1D5DB' : 'var(--primary)',
              color: '#FFFFFF',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '800',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: cart.length > 0 ? 'var(--shadow-md)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Proceed to Payment</span>
              <ArrowRight size={18} />
            </div>
            <span>R{cartTotal.toFixed(2)}</span>
          </button>

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
            🔒 Review order details above. Payment and card details will be entered on the next step.
          </p>
        </div>

      </div>
    </div>
  );
}
