import React from 'react';
import { Star } from 'lucide-react';

export default function ReviewModal({
  isOpen,
  onClose,
  selectedOrder,
  rating,
  setRating,
  comment,
  setComment,
  onSubmitReview
}) {
  if (!isOpen || !selectedOrder) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      zIndex: 130,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        maxWidth: '400px',
        width: '100%',
        padding: '24px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-xl)'
      }} className="animate-fade-in">
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>Rate Your Cafeteria Meal</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          How was your meal for Order #{selectedOrder.order_number}?
        </p>

        {/* 5 Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '20px 0' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => setRating(star)}>
              <Star 
                size={32} 
                fill={star <= rating ? '#F59E0B' : 'none'} 
                color={star <= rating ? '#F59E0B' : '#D1D5DB'} 
              />
            </button>
          ))}
        </div>

        <textarea
          placeholder="Tell the chef what you liked or how fast collection was..."
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            fontSize: '13px',
            marginBottom: '16px'
          }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '12px', backgroundColor: '#F3F4F6', borderRadius: '8px', fontWeight: '700' }}
          >
            Cancel
          </button>
          <button
            onClick={onSubmitReview}
            style={{ flex: 1, padding: '12px', backgroundColor: 'var(--primary)', color: '#FFFFFF', borderRadius: '8px', fontWeight: '700' }}
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
