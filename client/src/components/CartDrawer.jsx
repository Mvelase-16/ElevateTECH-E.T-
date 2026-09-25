import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { cart, cartCount, cartSubtotal, serviceFee, cartTotal, updateQuantity, removeFromCart } = useCart();

  if (!isOpen) return null;

  const handleGoToCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#FFFFFF',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)'
      }} className="animate-fade-in">
        
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          backgroundColor: 'var(--primary)',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Your Cart ({cartCount})</h3>
            <span style={{ fontSize: '11px', opacity: 0.85 }}>Walter Sisulu University Cafeteria</span>
          </div>
          <button onClick={onClose} style={{ color: '#FFFFFF', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        {/* Meal Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                Your cart is empty
              </p>
              <p style={{ fontSize: '13px' }}>Add delicious campus meals to get started!</p>
            </div>
          ) : (
            cart.map(item => (
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
                    <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', maxWidth: '170px' }}>
                      {item.name}
                    </h5>
                    <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>
                      R{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      backgroundColor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ fontSize: '13px', fontWeight: '700', width: '18px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      backgroundColor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Plus size={13} />
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    style={{ color: '#DC2626', marginLeft: '4px' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Subtotal & Fee Preview */}
          {cart.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '2px dashed var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <span>Subtotal</span>
                <span>R{cartSubtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                <span>Packaging Fee</span>
                <span>R{serviceFee.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '17px',
                fontWeight: '800',
                color: 'var(--primary)',
                borderTop: '1px solid var(--border)',
                paddingTop: '10px'
              }}>
                <span>Total Amount</span>
                <span>R{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation CTA */}
        {cart.length > 0 && (
          <div style={{ padding: '18px 20px', borderTop: '1px solid var(--border)', backgroundColor: '#FAFAFA' }}>
            <button
              onClick={handleGoToCheckout}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '800',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow-md)',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </div>
              <span>R{cartTotal.toFixed(2)}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}