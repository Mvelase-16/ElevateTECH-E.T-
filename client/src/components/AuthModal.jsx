import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', phone: '' });

  if (!isOpen) return null;

  const handleSubmit = () => {
    const nameToUse = form.name || form.email.split('@')[0] || 'Nikelwa';
    const userObj = {
      id: Date.now(),
      name: nameToUse,
      email: form.email || 'student@wsu.ac.za',
      role: form.role || 'student',
      phone: form.phone || '0812345678'
    };
    onLoginSuccess(userObj);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      zIndex: 120,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        maxWidth: '420px',
        width: '100%',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)'
      }} className="animate-fade-in">
        {/* Header */}
        <div style={{ backgroundColor: 'var(--primary)', color: '#FFFFFF', padding: '24px', textAlign: 'center', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', color: '#FFFFFF' }}>
            <X size={20} />
          </button>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Uni<span style={{ color: '#FCD34D' }}>BITES</span></h2>
          <p style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>Good Food. Good Mood.</p>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '20px' }}>
            <button
              onClick={() => setAuthMode('login')}
              style={{
                flex: 1,
                padding: '10px',
                fontWeight: '700',
                fontSize: '14px',
                color: authMode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: authMode === 'login' ? '2px solid var(--primary)' : 'none',
                marginBottom: '-2px'
              }}
            >
              Log In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              style={{
                flex: 1,
                padding: '10px',
                fontWeight: '700',
                fontSize: '14px',
                color: authMode === 'signup' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: authMode === 'signup' ? '2px solid var(--primary)' : 'none',
                marginBottom: '-2px'
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Quick Demo Shortcuts */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <button
              type="button"
              onClick={() => {
                onLoginSuccess({ id: 1, name: 'Nikelwa Sophazi', email: 'student@wsu.ac.za', role: 'student', phone: '0812345678' });
                onClose();
              }}
              style={{ flex: 1, padding: '8px', borderRadius: '6px', backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', fontSize: '11px', fontWeight: '700' }}
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => {
                onLoginSuccess({ id: 2, name: 'Campus Cafeteria Staff', email: 'cafeteria@wsu.ac.za', role: 'vendor', phone: '0475022844' });
                onClose();
              }}
              style={{ flex: 1, padding: '8px', borderRadius: '6px', backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '11px', fontWeight: '700' }}
            >
              Demo Kitchen Staff
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {authMode === 'signup' && (
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            )}
            <input
              type="email"
              placeholder="Campus Email (e.g. student@wsu.ac.za)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />

            <button
              onClick={handleSubmit}
              style={{
                padding: '14px',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontWeight: '800',
                marginTop: '8px'
              }}
            >
              {authMode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
