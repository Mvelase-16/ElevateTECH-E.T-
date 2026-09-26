import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Mail, Phone, ShieldCheck, CheckCircle2, AlertCircle, LogOut, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UserProfileModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { currentUser, updateProfile, logout } = useAuth();

  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (currentUser?.phone) {
      setPhone(currentUser.phone);
    }
  }, [currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSavePhone = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    if (phone && phone.trim().length < 9) {
      setSaveError('Please enter a valid phone number (at least 9 digits).');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ phone: phone.trim() });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message || 'Failed to update phone number.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const handleGoToOrders = () => {
    onClose();
    navigate('/orders');
  };

  const studentName = currentUser.first_name && currentUser.last_name
    ? `${currentUser.first_name} ${currentUser.last_name}`
    : (currentUser.name || 'WSU Student');

  const initials = (currentUser.first_name?.[0] || 'U') + (currentUser.last_name?.[0] || 'B');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      backdropFilter: 'blur(3px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }} onClick={onClose}>
      <div 
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border)'
        }}
        className="animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Maroon UniBITES Branding */}
        <div style={{
          backgroundColor: 'var(--primary)',
          color: '#FFFFFF',
          padding: '24px 20px',
          position: 'relative',
          textAlign: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '16px',
              top: '16px',
              color: 'rgba(255, 255, 255, 0.85)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          {/* Avatar Initials Badge */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            color: 'var(--primary)',
            fontSize: '24px',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px',
            boxShadow: 'var(--shadow-md)'
          }}>
            {initials.toUpperCase()}
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px', color: '#FFFFFF' }}>
            {studentName}
          </h3>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '800', color: '#FCD34D' }}>
            <Sparkles size={12} />
            <span>Walter Sisulu University Student</span>
          </div>
        </div>

        {/* Modal Body: Personal Details */}
        <div style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Personal Account Details
          </h4>

          {saveSuccess && (
            <div style={{
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              <span>Contact phone number updated successfully!</span>
            </div>
          )}

          {saveError && (
            <div style={{
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{saveError}</span>
            </div>
          )}

          {/* Detail Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
            
            {/* Full Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <User size={18} color="var(--primary)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', display: 'block' }}>FULL NAME</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{studentName}</span>
              </div>
            </div>

            {/* Registered Campus Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <Mail size={18} color="var(--primary)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', display: 'block' }}>CAMPUS EMAIL</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{currentUser.email}</span>
              </div>
              <ShieldCheck size={16} color="var(--success)" title="Verified Campus Email" />
            </div>

            {/* Contact Phone (Editable) */}
            <form onSubmit={handleSavePhone} style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Phone size={18} color="var(--primary)" />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', display: 'block' }}>CONTACT PHONE NUMBER</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0821234567"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                      fontWeight: '700',
                      marginTop: '4px',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Phone Number'}
                </button>
              </div>
            </form>

          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <button
              onClick={handleGoToOrders}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid var(--primary-light)',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                fontSize: '13px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <span>📋 View My Orders & PINs</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #FECACA',
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} />
              <span>Sign Out of UniBITES</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
