import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, LogOut, User, ChefHat, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import UserProfileModal from './UserProfileModal';

export default function Navbar({ onOpenCart, hasActiveOrders }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isVendor = currentUser?.role === 'vendor' || currentUser?.role === 'staff' || currentUser?.role === 'admin';
  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      backgroundColor: 'var(--primary)',
      color: '#FFFFFF',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-md)'
    }}>
      {/* Top Brand Bar */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Brand Logo */}
        <Link 
          to={isVendor ? '/kitchen' : '/'}
          style={{ textDecoration: 'none', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div style={{
            backgroundColor: '#FFFFFF',
            color: 'var(--primary)',
            fontWeight: '900',
            fontSize: '18px',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {isVendor ? '👨‍🍳' : 'UB'}
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', lineHeight: 1 }}>
              Uni<span style={{ color: '#FCD34D' }}>BITES</span>
            </h1>
            <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: '600' }}>
              {isVendor ? 'Kitchen Operations Portal' : 'Good Food. Good Mood.'}
            </span>
          </div>
        </Link>

        {/* Right Actions: Cart & User/Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Cart Button (Only for students) */}
          {!isVendor && (
            <button
              onClick={onOpenCart || (() => navigate('/checkout'))}
              title="View Cart & Checkout"
              style={{
                backgroundColor: currentPath === '/checkout' ? '#FCD34D' : 'rgba(255,255,255,0.2)',
                color: currentPath === '/checkout' ? 'var(--primary)' : '#FFFFFF',
                padding: '7px 12px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '800',
                fontSize: '13px',
                transition: 'all 0.15s',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <ShoppingBag size={17} />
              <span>{cartCount}</span>
            </button>
          )}

          {/* User Name Pill or Sign In Button */}
          {isAuthenticated ? (
            <>
              {/* If student: Clickable user icon opens Personal Details Modal */}
              {!isVendor ? (
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  title="Click to view your personal details"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <User size={15} />
                  <span style={{ maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser?.first_name || currentUser?.name?.split(' ')[0] || 'Profile'}
                  </span>
                </button>
              ) : (
                /* If staff: Staff badge (does not open student profile modal) */
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#FFFFFF'
                }}>
                  <ChefHat size={15} color="#FCD34D" />
                  <span>Staff: {currentUser?.first_name || currentUser?.name?.split(' ')[0] || 'Kitchen'}</span>
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Log Out"
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--primary)',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '800',
                textDecoration: 'none'
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Role-Specific Navigation Tabs */}
      {!isVendor && (
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.12)',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            padding: '0 16px'
          }}>
            <Link
              to="/"
              style={{
                flex: 1,
                padding: '10px 14px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: currentPath === '/' ? '800' : '600',
                color: currentPath === '/' ? '#FFFFFF' : 'rgba(255,255,255,0.75)',
                borderBottom: currentPath === '/' ? '3px solid #FCD34D' : '3px solid transparent',
                textDecoration: 'none'
              }}
            >
              🍔 Live Menu
            </Link>

            <Link
              to="/checkout"
              style={{
                flex: 1,
                padding: '10px 14px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: currentPath === '/checkout' ? '800' : '600',
                color: currentPath === '/checkout' ? '#FFFFFF' : 'rgba(255,255,255,0.75)',
                borderBottom: currentPath === '/checkout' ? '3px solid #FCD34D' : '3px solid transparent',
                textDecoration: 'none'
              }}
            >
              💳 Checkout ({cartCount})
            </Link>

            <Link
              to="/orders"
              style={{
                flex: 1,
                padding: '10px 14px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: currentPath === '/orders' ? '800' : '600',
                color: currentPath === '/orders' ? '#FFFFFF' : 'rgba(255,255,255,0.75)',
                borderBottom: currentPath === '/orders' ? '3px solid #FCD34D' : '3px solid transparent',
                textDecoration: 'none',
                position: 'relative'
              }}
            >
              <span>📋 Orders & PINs</span>
              {hasActiveOrders && (
                <span style={{
                  display: 'inline-block',
                  width: '7px',
                  height: '7px',
                  backgroundColor: '#10B981',
                  borderRadius: '50%',
                  marginLeft: '6px',
                  verticalAlign: 'middle'
                }} />
              )}
            </Link>
          </div>
        </div>
      )}
      
      {/* Student Personal Details & Profile Modal (Only applies to student side) */}
      {!isVendor && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </header>
  );
}
