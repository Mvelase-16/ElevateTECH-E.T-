import React from 'react';
import { X, CreditCard, DollarSign, RefreshCw } from 'lucide-react';

export default function PaymentModal({
  isOpen,
  onClose,
  cartTotal,
  selectedTimeSlot,
  paymentMethod,
  setPaymentMethod,
  cardDetails,
  setCardDetails,
  onFillDemoCard,
  onConfirmOrder,
  isProcessingPayment
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      zIndex: 110,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        maxWidth: '480px',
        width: '100%',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)'
      }} className="animate-fade-in">
        {/* Header */}
        <div style={{
          backgroundColor: 'var(--primary)',
          color: '#FFFFFF',
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Choose Payment Method</h3>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>Total: R{cartTotal.toFixed(2)}</span>
          </div>
          <button onClick={onClose} style={{ color: '#FFFFFF' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Method Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={() => setPaymentMethod('Card')}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid',
                borderColor: paymentMethod === 'Card' ? 'var(--primary)' : 'var(--border)',
                backgroundColor: paymentMethod === 'Card' ? 'var(--primary-subtle)' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '700',
                fontSize: '13px',
                color: paymentMethod === 'Card' ? 'var(--primary)' : 'var(--text-main)'
              }}
            >
              <CreditCard size={18} />
              <span>Card (Visa/MC)</span>
            </button>

            <button
              onClick={() => setPaymentMethod('Cash on Pickup')}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid',
                borderColor: paymentMethod === 'Cash on Pickup' ? 'var(--primary)' : 'var(--border)',
                backgroundColor: paymentMethod === 'Cash on Pickup' ? 'var(--primary-subtle)' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '700',
                fontSize: '13px',
                color: paymentMethod === 'Cash on Pickup' ? 'var(--primary)' : 'var(--text-main)'
              }}
            >
              <DollarSign size={18} />
              <span>Cash on Pickup</span>
            </button>
          </div>

          {/* Form */}
          {paymentMethod === 'Card' ? (
            <div>
              {/* Virtual Card Preview */}
              <div style={{
                background: 'linear-gradient(135deg, #7A0C2E 0%, #2A0815 100%)',
                borderRadius: '14px',
                padding: '18px 20px',
                color: '#FFFFFF',
                marginBottom: '16px',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '1px' }}>UniBITES CAMPUS CARD</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#FCD34D' }}>VISA</span>
                </div>

                <div style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '3px', marginBottom: '16px', fontFamily: 'monospace' }}>
                  {cardDetails.number || '•••• •••• •••• ••••'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '11px' }}>
                  <div>
                    <div style={{ opacity: 0.7, fontSize: '9px' }}>CARDHOLDER</div>
                    <div style={{ fontWeight: '700' }}>{cardDetails.holder || 'STUDENT NAME'}</div>
                  </div>
                  <div>
                    <div style={{ opacity: 0.7, fontSize: '9px' }}>EXPIRES</div>
                    <div style={{ fontWeight: '700' }}>{cardDetails.expiry || 'MM/YY'}</div>
                  </div>
                </div>
              </div>

              {/* Demo Auto-Fill Button */}
              <div style={{ textAlign: 'right', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={onFillDemoCard}
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    backgroundColor: 'var(--primary-subtle)',
                    padding: '6px 12px',
                    borderRadius: '6px'
                  }}
                >
                  ✨ Auto-Fill Demo Presentation Card
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Card Number (16 digits)"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Expiry (MM/YY)"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                  />
                  <input
                    type="text"
                    placeholder="CVV (3 digits)"
                    maxLength={4}
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#F9FAFB',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <DollarSign size={32} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Pay With Cash at Collection</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Please bring exact cash (R{cartTotal.toFixed(2)}) to Cafeteria Counter 1 during your pickup window ({selectedTimeSlot}).
              </p>
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={onConfirmOrder}
            disabled={isProcessingPayment}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isProcessingPayment ? 'wait' : 'pointer'
            }}
          >
            {isProcessingPayment ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <span>Confirm & Pay R{cartTotal.toFixed(2)}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
