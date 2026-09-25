import React from 'react';
import { Heart, Plus } from 'lucide-react';

export default function FoodCard({ item, isFavorite, onToggleFavorite, onAddToCart }) {
  return (
    <div 
      className="food-card-horizontal"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        opacity: item.is_available ? 1 : 0.65,
        transition: 'transform 0.15s, box-shadow 0.15s'
      }}
    >
      {/* Food Image */}
      <div 
        className="food-img-container"
        style={{
          position: 'relative',
          height: '175px',
          backgroundColor: '#E5E7EB',
          overflow: 'hidden'
        }}
      >
        <img 
          src={item.image_url} 
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
          }}
        />

        {/* Favorite Heart (Desktop Floating) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Heart 
            size={16} 
            color={isFavorite ? '#DC2626' : 'var(--text-muted)'} 
            fill={isFavorite ? '#DC2626' : 'none'} 
          />
        </button>

        {!item.is_available && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: '800',
            padding: '3px 8px',
            borderRadius: '6px'
          }}>
            SOLD OUT
          </div>
        )}
      </div>

      {/* Content */}
      <div className="food-info" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '3px', lineHeight: 1.25 }}>
            {item.name}
          </h3>
          <p className="food-desc" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.35 }}>
            {item.description}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <span style={{ fontSize: '17px', fontWeight: '800', color: 'var(--primary)' }}>
            R{parseFloat(item.price).toFixed(2)}
          </span>

          <button
            onClick={() => onAddToCart(item)}
            disabled={!item.is_available}
            style={{
              backgroundColor: item.is_available ? 'var(--primary)' : '#9CA3AF',
              color: '#FFFFFF',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: item.is_available ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Plus size={14} />
            <span>{item.is_available ? 'Add' : 'Sold Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
