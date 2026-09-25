import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your campus email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset instructions.');
      }

      setSuccessInfo(data);
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F9FA',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px'
    }}>
      {/* Brand Header Banner */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: 'var(--primary)',
        color: '#FFFFFF',
        padding: '32px 24px 26px',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-md)',
        position: 'relative'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          color: 'var(--primary)',
          fontWeight: '900',
          fontSize: '22px',
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          UB
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Uni<span style={{ color: '#FCD34D' }}>BITES</span>
        </h1>
        <p style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px', fontWeight: '500' }}>
          Password Recovery • Walter Sisulu University
        </p>
      </div>

      {/* Card Body */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        padding: '28px 24px',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border)',
        borderTop: 'none'
      }}>
        {successInfo ? (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={34} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
              Check Your Inbox
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
              {successInfo.message}
            </p>

            {/* Development Mode Quick Test Link (if SMTP is not configured) */}
            {successInfo.devResetLink && (
              <div style={{
                backgroundColor: 'var(--warning-bg)',
                border: '1px dashed var(--accent)',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontWeight: '800', fontSize: '12px', marginBottom: '6px' }}>
                  <Sparkles size={15} />
                  <span>Development Preview Link</span>
                </div>
                <p style={{ fontSize: '12px', color: '#78350F', marginBottom: '10px' }}>
                  Since SMTP is in local mode, you can open your reset link directly below:
                </p>
                <a
                  href={successInfo.devResetLink}
                  style={{
                    display: 'block',
                    padding: '8px 12px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid var(--accent)',
                    color: 'var(--primary)',
                    fontSize: '12px',
                    fontWeight: '700',
                    wordBreak: 'break-all',
                    textDecoration: 'none'
                  }}
                >
                  🔗 {successInfo.devResetLink}
                </a>
              </div>
            )}

            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <span>Return to Sign In</span>
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: '700',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Login</span>
              </button>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
              Forgot your password?
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
              Enter the campus email address associated with your UniBITES account. We will send you a secure link to reset your password.
            </p>

            {errorMessage && (
              <div style={{
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(220, 38, 38, 0.2)'
              }}>
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Registered Campus Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    placeholder="student@wsu.ac.za"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      outline: 'none',
                      fontSize: '14px',
                      backgroundColor: '#FAFAFA'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <span>{isSubmitting ? 'Sending Link...' : 'Send Reset Link'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link
                to="/login"
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  textDecoration: 'underline'
                }}
              >
                Remember your password? Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
